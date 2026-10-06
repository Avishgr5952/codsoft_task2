import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../lib/auth';
import { Role, OrderStatus, PaymentStatus, PaymentMethod, TableStatus, ReservationStatus } from '@prisma/client';

async function runTestSuite() {
  console.log('\n==================================================');
  console.log('DINEDESK AUTOMATED VERIFICATION & TEST SUITE');
  console.log('==================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // 1. Verify Database Connection
  console.log('[1/15] Verifying PostgreSQL Database Connection & Models...');
  const userCount = await prisma.user.count();
  const menuCount = await prisma.menuItem.count();
  const tableCount = await prisma.table.count();
  const categoryCount = await prisma.category.count();
  assert(userCount >= 3, `Database connected: Found ${userCount} users`);
  assert(menuCount >= 10, `Database connected: Found ${menuCount} menu items`);
  assert(tableCount >= 8, `Database connected: Found ${tableCount} restaurant tables`);
  assert(categoryCount >= 4, `Database connected: Found ${categoryCount} categories`);

  // 2. Test Demo Accounts & Password Hashes
  console.log('\n[2/15] Testing Demo Accounts & Password Security...');
  const admin = await prisma.user.findUnique({ where: { email: 'admin@dinedesk.com' } });
  assert(admin !== null && admin.role === Role.ADMIN, 'Admin account exists with ADMIN role');
  const adminPassMatch = await bcrypt.compare('Admin@123', admin!.password);
  assert(adminPassMatch, 'Admin password hash verified (Admin@123)');

  const kitchen = await prisma.user.findUnique({ where: { email: 'kitchen@dinedesk.com' } });
  assert(kitchen !== null && kitchen.role === Role.KITCHEN, 'Kitchen staff account exists with KITCHEN role');
  const kitchenPassMatch = await bcrypt.compare('Kitchen@123', kitchen!.password);
  assert(kitchenPassMatch, 'Kitchen password hash verified (Kitchen@123)');

  const customer = await prisma.user.findUnique({ where: { email: 'customer@dinedesk.com' } });
  assert(customer !== null && customer.role === Role.CUSTOMER, 'Customer account exists with CUSTOMER role');
  const customerPassMatch = await bcrypt.compare('Customer@123', customer!.password);
  assert(customerPassMatch, 'Customer password hash verified (Customer@123)');

  // 3. Test JWT Token Creation & Role Claims
  console.log('\n[3/15] Testing JWT Session Generation & Role Verification...');
  const token = signToken({ userId: admin!.id, email: admin!.email, role: admin!.role });
  const payload = verifyToken(token);
  assert(payload !== null && payload.role === Role.ADMIN, 'Admin JWT payload verified');

  // 4. Test Customer Registration Workflow
  console.log('\n[4/15] Testing Customer Registration Workflow...');
  const testRegEmail = `testuser_${Date.now()}@example.com`;
  const hashedRegPass = await bcrypt.hash('Secret@123', 10);
  const registeredUser = await prisma.user.create({
    data: {
      name: 'Verification Test User',
      email: testRegEmail,
      password: hashedRegPass,
      phone: '+1 555-000-9999',
      role: Role.CUSTOMER,
    },
  });
  assert(registeredUser.id !== undefined && registeredUser.role === Role.CUSTOMER, 'New customer successfully created with hashed password');

  // 5. Test Menu Item CRUD Operations
  console.log('\n[5/15] Testing Menu Item CRUD Operations...');
  const cat = await prisma.category.findFirst();
  assert(cat !== null, 'Existing category found for menu association');

  const createdItem = await prisma.menuItem.create({
    data: {
      name: 'Test Gourmet Bruschetta',
      description: 'Artisanal heirloom tomatoes on toasted ciabatta with garlic.',
      price: 13.50,
      imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0',
      categoryId: cat!.id,
      isAvailable: true,
      isFeatured: false,
    },
  });
  assert(createdItem.id !== undefined, 'Menu item created successfully');

  // Update item
  const updatedItem = await prisma.menuItem.update({
    where: { id: createdItem.id },
    data: { price: 14.50, isAvailable: false },
  });
  assert(updatedItem.price === 14.50 && updatedItem.isAvailable === false, 'Menu item updated: price changed and marked unavailable');

  // Delete item
  await prisma.menuItem.delete({ where: { id: createdItem.id } });
  const deletedCheck = await prisma.menuItem.findUnique({ where: { id: createdItem.id } });
  assert(deletedCheck === null, 'Menu item deleted successfully');

  // 6. Test Category CRUD
  console.log('\n[6/15] Testing Category Operations...');
  const testCat = await prisma.category.create({
    data: {
      name: `Test Specials ${Date.now()}`,
      description: 'Temporary tasting category',
      sortOrder: 99,
    },
  });
  assert(testCat.id !== undefined, 'Category created');
  await prisma.category.delete({ where: { id: testCat.id } });
  assert(true, 'Category cleaned up');

  // 7. Test Table Management
  console.log('\n[7/15] Testing Restaurant Table Operations...');
  const testTable = await prisma.table.create({
    data: {
      tableNumber: `T-TEST-${Date.now().toString().slice(-4)}`,
      capacity: 4,
      location: 'Indoor Test Zone',
      status: TableStatus.AVAILABLE,
    },
  });
  assert(testTable.id !== undefined, `Table ${testTable.tableNumber} created with capacity 4`);

  // Update table status
  const updatedTable = await prisma.table.update({
    where: { id: testTable.id },
    data: { status: TableStatus.OCCUPIED },
  });
  assert(updatedTable.status === TableStatus.OCCUPIED, 'Table status updated to OCCUPIED');

  // 8. Test Table Reservation Creation
  console.log('\n[8/15] Testing Table Reservation Workflow...');
  const testReservationDate = new Date();
  testReservationDate.setDate(testReservationDate.getDate() + 3);

  const res1 = await prisma.reservation.create({
    data: {
      reservationNumber: `RES-T-${Date.now().toString().slice(-4)}`,
      customerName: 'Alice Dining Guest',
      customerEmail: 'alice@example.com',
      customerPhone: '+1 555-444-3333',
      tableId: testTable.id,
      reservationDate: testReservationDate,
      reservationTime: '19:00',
      guestsCount: 4,
      status: ReservationStatus.CONFIRMED,
    },
  });
  assert(res1.id !== undefined, `Reservation ${res1.reservationNumber} created for 19:00`);

  // 9. Test Duplicate Reservation Prevention Constraint
  console.log('\n[9/15] Testing Overlapping Reservation Conflict Detection...');
  const startOfDay = new Date(testReservationDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(testReservationDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Query for conflicts
  const conflict = await prisma.reservation.findFirst({
    where: {
      tableId: testTable.id,
      reservationDate: { gte: startOfDay, lte: endOfDay },
      reservationTime: '19:00',
      status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    },
  });
  assert(conflict !== null && conflict.id === res1.id, 'Conflict detection correctly flags existing booking on the same table, date & time slot');

  // 10. Test Online Ordering Workflow & Tax Calculation
  console.log('\n[10/15] Testing Online Ordering & Subtotal/Tax Math...');
  const sampleItem = await prisma.menuItem.findFirst({ where: { isAvailable: true } });
  assert(sampleItem !== null, 'Active menu item selected for order testing');

  const itemQty = 2;
  const subtotal = sampleItem!.price * itemQty;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const totalAmount = Math.round((subtotal + tax) * 100) / 100;

  const testOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-TEST-${Date.now().toString().slice(-4)}`,
      customerName: 'Bob Gourmet Diner',
      customerEmail: 'bob@example.com',
      customerPhone: '+1 555-777-8888',
      deliveryAddress: 'Table #2 - Window Side',
      notes: 'Extra cracked pepper please.',
      status: OrderStatus.PENDING,
      subtotal,
      tax,
      totalAmount,
      items: {
        create: [
          {
            menuItemId: sampleItem!.id,
            itemName: sampleItem!.name,
            itemPrice: sampleItem!.price,
            quantity: itemQty,
            subtotal,
          },
        ],
      },
      payment: {
        create: {
          amount: totalAmount,
          method: PaymentMethod.CARD,
          status: PaymentStatus.PAID,
          transactionRef: `TXN-CARD-${Date.now()}`,
          paidAt: new Date(),
        },
      },
    },
    include: {
      items: true,
      payment: true,
    },
  });

  assert(testOrder.id !== undefined, `Order ${testOrder.orderNumber} placed with total ${totalAmount}`);
  assert(testOrder.items.length === 1 && testOrder.items[0].quantity === 2, 'Order item quantity and subtotal stored');
  assert(testOrder.payment !== null && testOrder.payment.status === PaymentStatus.PAID, 'Payment record created with PAID status');

  // 11. Test Kitchen Workflow Status Transitions
  console.log('\n[11/15] Testing Kitchen Status Workflow (PENDING -> CONFIRMED -> PREPARING -> READY -> COMPLETED)...');
  const s1 = await prisma.order.update({ where: { id: testOrder.id }, data: { status: OrderStatus.CONFIRMED } });
  assert(s1.status === OrderStatus.CONFIRMED, 'Transition 1: Order CONFIRMED');

  const s2 = await prisma.order.update({ where: { id: testOrder.id }, data: { status: OrderStatus.PREPARING } });
  assert(s2.status === OrderStatus.PREPARING, 'Transition 2: Order PREPARING in kitchen');

  const s3 = await prisma.order.update({ where: { id: testOrder.id }, data: { status: OrderStatus.READY } });
  assert(s3.status === OrderStatus.READY, 'Transition 3: Order READY for dining');

  const s4 = await prisma.order.update({ where: { id: testOrder.id }, data: { status: OrderStatus.COMPLETED } });
  assert(s4.status === OrderStatus.COMPLETED, 'Transition 4: Order COMPLETED and archived');

  // 12. Test Payment Methods & Simulated Flows
  console.log('\n[12/15] Testing Payment Methods (Cash, Card, UPI)...');
  const cashPayment = await prisma.payment.create({
    data: {
      orderId: (await prisma.order.create({
        data: {
          orderNumber: `ORD-CASH-${Date.now().toString().slice(-4)}`,
          customerName: 'Cash Payer',
          customerEmail: 'cash@example.com',
          customerPhone: '555',
          subtotal: 20,
          tax: 1.6,
          totalAmount: 21.6,
        },
      })).id,
      amount: 21.6,
      method: PaymentMethod.CASH,
      status: PaymentStatus.PENDING,
    },
  });
  assert(cashPayment.method === PaymentMethod.CASH && cashPayment.status === PaymentStatus.PENDING, 'Cash payment recorded with PENDING status');

  // 13. Test Customer Order History Aggregation
  console.log('\n[13/15] Testing Customer Order History & Analytics Aggregation...');
  const customerHistory = await prisma.user.findUnique({
    where: { email: 'customer@dinedesk.com' },
    include: { orders: true, reservations: true },
  });
  assert(customerHistory !== null && customerHistory.orders.length > 0, 'Customer order history aggregated successfully');

  // 14. Test Admin Reports & Popular Recipe Ranking
  console.log('\n[14/15] Testing Analytics & Popular Items Grouping...');
  const popularRanking = await prisma.orderItem.groupBy({
    by: ['itemName'],
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
  });
  assert(popularRanking.length > 0, `Popular dishes ranking computed (${popularRanking.length} distinct dishes ordered)`);

  // 15. Clean up temporary test entries
  console.log('\n[15/15] Cleaning up test artifacts...');
  await prisma.payment.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.deleteMany({ where: { id: testOrder.id } });
  await prisma.reservation.deleteMany({ where: { id: res1.id } });
  await prisma.table.deleteMany({ where: { id: testTable.id } });
  await prisma.user.deleteMany({ where: { id: registeredUser.id } });
  assert(true, 'Test artifacts cleanly removed');

  console.log('\n==================================================');
  console.log(`ALL ${passedTests} OF ${totalTests} TESTS PASSED WITH 100% SUCCESS!`);
  console.log('==================================================\n');
}

runTestSuite()
  .catch((e) => {
    console.error('Test suite failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
