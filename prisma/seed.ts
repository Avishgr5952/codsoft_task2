import { PrismaClient, Role, OrderStatus, PaymentStatus, PaymentMethod, TableStatus, ReservationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting DineDesk database seeding...');

  // 1. Clean existing records in correct referential order
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const kitchenPasswordHash = await bcrypt.hash('Kitchen@123', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@dinedesk.com',
      password: adminPasswordHash,
      phone: '+1 (555) 019-2831',
      role: Role.ADMIN,
    },
  });

  const kitchenUser = await prisma.user.create({
    data: {
      name: 'Head Chef Marco',
      email: 'kitchen@dinedesk.com',
      password: kitchenPasswordHash,
      phone: '+1 (555) 014-9823',
      role: Role.KITCHEN,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'customer@dinedesk.com',
      password: customerPasswordHash,
      phone: '+1 (555) 012-3456',
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Sophia Williams',
      email: 'sophia.williams@example.com',
      password: customerPasswordHash,
      phone: '+1 (555) 017-7890',
      role: Role.CUSTOMER,
    },
  });

  console.log('[Seed] Users seeded: Admin, Kitchen Staff, and Customers');

  // 4. Create Categories
  const catStarters = await prisma.category.create({
    data: {
      name: 'Starters',
      description: 'Crisp appetizers and mouth-watering bites to begin your culinary journey.',
      image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
      sortOrder: 1,
      isActive: true,
    },
  });

  const catMains = await prisma.category.create({
    data: {
      name: 'Main Course',
      description: 'Hearty, gourmet entrées prepared with fresh, premium farm ingredients.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      sortOrder: 2,
      isActive: true,
    },
  });

  const catDesserts = await prisma.category.create({
    data: {
      name: 'Desserts',
      description: 'Artisanal sweet creations, velvety pastries, and house-made indulgences.',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
      sortOrder: 3,
      isActive: true,
    },
  });

  const catBeverages = await prisma.category.create({
    data: {
      name: 'Beverages',
      description: 'Handcrafted mocktails, specialty roast coffees, and chilled artisan coolers.',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      sortOrder: 4,
      isActive: true,
    },
  });

  console.log('[Seed] Categories seeded');

  // 5. Create Menu Items
  const menuItemsData = [
    // Starters
    {
      name: 'Truffle Parmesan Fries',
      description: 'Hand-cut golden potatoes tossed in white truffle oil, grated aged parmesan, and fresh rosemary with garlic aioli dip.',
      price: 11.50,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
      categoryId: catStarters.id,
      isAvailable: true,
      isFeatured: true,
    },
    {
      name: 'Crispy Calamari Rings',
      description: 'Tender squid rings lightly dusted with seasoned sea salt, flash-fried and served with smoky chipotle dip and charred lemon.',
      price: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
      categoryId: catStarters.id,
      isAvailable: true,
      isFeatured: false,
    },
    {
      name: 'Burrata Caprese Bruschetta',
      description: 'Creamy artisanal burrata atop toasted sourdough, heirloom grape tomatoes, micro-basil, and aged balsamic glaze.',
      price: 14.50,
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef11d54?auto=format&fit=crop&w=800&q=80',
      categoryId: catStarters.id,
      isAvailable: true,
      isFeatured: true,
    },
    {
      name: 'Spicy Buffalo Cauliflower',
      description: 'Golden roasted cauliflower florets tossed in house buffalo glaze, paired with creamy vegan ranch and celery batons.',
      price: 12.00,
      imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
      categoryId: catStarters.id,
      isAvailable: true,
      isFeatured: false,
    },

    // Main Course
    {
      name: 'Pan-Seared Atlantic Salmon',
      description: 'Crisp skin wild salmon fillet over creamy lemon-dill risotto, charred asparagus spears, and saffron beurre blanc.',
      price: 28.50,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
      categoryId: catMains.id,
      isAvailable: true,
      isFeatured: true,
    },
    {
      name: 'Prime Black Angus Ribeye Steak',
      description: '10 oz prime cut dry-aged steak seared with garlic herb butter, roasted fingerling potatoes, and red wine reduction.',
      price: 36.00,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      categoryId: catMains.id,
      isAvailable: true,
      isFeatured: true,
    },
    {
      name: 'Handmade Truffle Tagliatelle',
      description: 'Fresh egg pasta tossed with wild forest mushrooms, shaved black winter truffle, and 24-month Parmigiano-Reggiano.',
      price: 24.00,
      imageUrl: 'https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=800&q=80',
      categoryId: catMains.id,
      isAvailable: true,
      isFeatured: true,
    },
    {
      name: 'DineDesk Signature Wagyu Burger',
      description: 'Double Wagyu smash patties, melted vintage cheddar, caramelized onions, smoked bacon jam, and brioche bun with fries.',
      price: 21.00,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      categoryId: catMains.id,
      isAvailable: true,
      isFeatured: true,
    },
    {
      name: 'Wood-Fired Margherita Pizza',
      description: 'San Marzano tomato base, fresh buffalo mozzarella, aromatic sweet basil leaves, and cold-pressed extra virgin olive oil.',
      price: 18.00,
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
      categoryId: catMains.id,
      isAvailable: true,
      isFeatured: false,
    },

    // Desserts
    {
      name: 'Molten Belgian Chocolate Lava Cake',
      description: 'Warm dark chocolate souffle with a flowing liquid center, served with Madagascan vanilla bean gelato.',
      price: 11.00,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      categoryId: catDesserts.id,
      isAvailable: true,
      isFeatured: true,
    },
    {
      name: 'Classic Venetian Tiramisu',
      description: 'Espresso-soaked savoiardi ladyfingers layered with whipped mascarpone cream and dusted with raw Dutch cocoa.',
      price: 10.50,
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
      categoryId: catDesserts.id,
      isAvailable: true,
      isFeatured: true,
    },
    {
      name: 'New York Baked Berry Cheesecake',
      description: 'Velvety cream cheese cake on a graham cracker crust, crowned with warm mixed berry compote.',
      price: 9.50,
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      categoryId: catDesserts.id,
      isAvailable: true,
      isFeatured: false,
    },

    // Beverages
    {
      name: 'Signature Passionfruit Spritz',
      description: 'Fresh passionfruit pulp, sparkling elderflower tonic, lime, mint sprigs, and crushed ice.',
      price: 7.50,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      categoryId: catBeverages.id,
      isAvailable: true,
      isFeatured: true,
    },
    {
      name: 'Smoked Vanilla Cold Brew',
      description: 'Slow-steeped single-origin Ethiopian beans with bourbon vanilla cream float.',
      price: 6.50,
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
      categoryId: catBeverages.id,
      isAvailable: true,
      isFeatured: false,
    },
    {
      name: 'Fresh Hibiscus Iced Cooler',
      description: 'Brewed wild hibiscus petals, pomegranate notes, crushed mint, and sparkling citrus splash.',
      price: 7.00,
      imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
      categoryId: catBeverages.id,
      isAvailable: true,
      isFeatured: false,
    },
  ];

  const createdMenuItems: any[] = [];
  for (const item of menuItemsData) {
    const created = await prisma.menuItem.create({ data: item });
    createdMenuItems.push(created);
  }
  console.log(`[Seed] Seeded ${createdMenuItems.length} menu items`);

  // 6. Create Restaurant Tables
  const tablesData = [
    { tableNumber: 'T-01', capacity: 2, location: 'Window Side (Street View)', status: TableStatus.AVAILABLE },
    { tableNumber: 'T-02', capacity: 2, location: 'Window Side (Street View)', status: TableStatus.AVAILABLE },
    { tableNumber: 'T-03', capacity: 4, location: 'Indoor Main Dining Hall', status: TableStatus.OCCUPIED },
    { tableNumber: 'T-04', capacity: 4, location: 'Indoor Main Dining Hall', status: TableStatus.AVAILABLE },
    { tableNumber: 'T-05', capacity: 6, location: 'Family Booth Alcove', status: TableStatus.RESERVED },
    { tableNumber: 'T-06', capacity: 8, location: 'Private VIP Room', status: TableStatus.AVAILABLE },
    { tableNumber: 'T-07', capacity: 2, location: 'Romantic Garden Patio', status: TableStatus.AVAILABLE },
    { tableNumber: 'T-08', capacity: 4, location: 'Romantic Garden Patio', status: TableStatus.MAINTENANCE },
  ];

  const createdTables: any[] = [];
  for (const table of tablesData) {
    const created = await prisma.table.create({ data: table });
    createdTables.push(created);
  }
  console.log(`[Seed] Seeded ${createdTables.length} tables`);

  // 7. Create Sample Reservations
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  await prisma.reservation.create({
    data: {
      reservationNumber: 'RES-8801',
      userId: customerUser.id,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone || '+1 555-012-3456',
      tableId: createdTables[4].id, // Table T-05
      reservationDate: today,
      reservationTime: '19:30',
      guestsCount: 5,
      specialRequests: 'Celebrating Alex\'s birthday. Quiet corner table preferred.',
      status: ReservationStatus.CONFIRMED,
    },
  });

  await prisma.reservation.create({
    data: {
      reservationNumber: 'RES-8802',
      userId: customer2.id,
      customerName: customer2.name,
      customerEmail: customer2.email,
      customerPhone: customer2.phone || '+1 555-017-7890',
      tableId: createdTables[1].id, // Table T-02
      reservationDate: tomorrow,
      reservationTime: '20:00',
      guestsCount: 2,
      specialRequests: 'Anniversary dinner with candle setup.',
      status: ReservationStatus.PENDING,
    },
  });

  console.log('[Seed] Sample reservations seeded');

  // 8. Create Sample Orders
  // Order 1: Ready order
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-1001',
      userId: customerUser.id,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone || '+1 555-012-3456',
      deliveryAddress: 'Table #3 - Indoor Hall',
      notes: 'Please keep salad dressing on the side.',
      status: OrderStatus.READY,
      subtotal: 52.50,
      tax: 4.20,
      totalAmount: 56.70,
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
      items: {
        create: [
          {
            menuItemId: createdMenuItems[0].id,
            itemName: createdMenuItems[0].name,
            itemPrice: createdMenuItems[0].price,
            quantity: 1,
            subtotal: 11.50,
          },
          {
            menuItemId: createdMenuItems[4].id,
            itemName: createdMenuItems[4].name,
            itemPrice: createdMenuItems[4].price,
            quantity: 1,
            subtotal: 28.50,
          },
          {
            menuItemId: createdMenuItems[11].id,
            itemName: createdMenuItems[11].name,
            itemPrice: createdMenuItems[11].price,
            quantity: 1,
            subtotal: 12.50,
          },
        ],
      },
      payment: {
        create: {
          amount: 56.70,
          method: PaymentMethod.CARD,
          status: PaymentStatus.PAID,
          transactionRef: 'TXN-CARD-99482',
          paidAt: new Date(Date.now() - 45 * 60 * 1000),
        },
      },
    },
  });

  // Order 2: Preparing order
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-1002',
      userId: customer2.id,
      customerName: customer2.name,
      customerEmail: customer2.email,
      customerPhone: customer2.phone || '+1 555-017-7890',
      deliveryAddress: 'Suite 404, Hudson Towers',
      notes: 'Extra napkins and cutlery please.',
      status: OrderStatus.PREPARING,
      subtotal: 48.00,
      tax: 3.84,
      totalAmount: 51.84,
      createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
      items: {
        create: [
          {
            menuItemId: createdMenuItems[7].id,
            itemName: createdMenuItems[7].name,
            itemPrice: createdMenuItems[7].price,
            quantity: 2,
            subtotal: 42.00,
          },
          {
            menuItemId: createdMenuItems[13].id,
            itemName: createdMenuItems[13].name,
            itemPrice: createdMenuItems[13].price,
            quantity: 1,
            subtotal: 6.00,
          },
        ],
      },
      payment: {
        create: {
          amount: 51.84,
          method: PaymentMethod.UPI,
          status: PaymentStatus.PAID,
          transactionRef: 'UPI-REF-23849182',
          paidAt: new Date(Date.now() - 20 * 60 * 1000),
        },
      },
    },
  });

  // Order 3: Pending order
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-1003',
      userId: customerUser.id,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone || '+1 555-012-3456',
      deliveryAddress: 'Table #1 - Window Side',
      notes: 'Allergies: Nut allergy, please verify.',
      status: OrderStatus.PENDING,
      subtotal: 39.50,
      tax: 3.16,
      totalAmount: 42.66,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
      items: {
        create: [
          {
            menuItemId: createdMenuItems[2].id,
            itemName: createdMenuItems[2].name,
            itemPrice: createdMenuItems[2].price,
            quantity: 1,
            subtotal: 14.50,
          },
          {
            menuItemId: createdMenuItems[6].id,
            itemName: createdMenuItems[6].name,
            itemPrice: createdMenuItems[6].price,
            quantity: 1,
            subtotal: 24.00,
          },
        ],
      },
      payment: {
        create: {
          amount: 42.66,
          method: PaymentMethod.CASH,
          status: PaymentStatus.PENDING,
        },
      },
    },
  });

  // Order 4: Completed order from yesterday
  const order4 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-0998',
      userId: customerUser.id,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone || '+1 555-012-3456',
      deliveryAddress: 'Table #4',
      status: OrderStatus.COMPLETED,
      subtotal: 65.50,
      tax: 5.24,
      totalAmount: 70.74,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            menuItemId: createdMenuItems[5].id,
            itemName: createdMenuItems[5].name,
            itemPrice: createdMenuItems[5].price,
            quantity: 1,
            subtotal: 36.00,
          },
          {
            menuItemId: createdMenuItems[9].id,
            itemName: createdMenuItems[9].name,
            itemPrice: createdMenuItems[9].price,
            quantity: 2,
            subtotal: 22.00,
          },
          {
            menuItemId: createdMenuItems[12].id,
            itemName: createdMenuItems[12].name,
            itemPrice: createdMenuItems[12].price,
            quantity: 1,
            subtotal: 7.50,
          },
        ],
      },
      payment: {
        create: {
          amount: 70.74,
          method: PaymentMethod.CARD,
          status: PaymentStatus.PAID,
          transactionRef: 'TXN-CARD-99120',
          paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log('[Seed] Sample orders and payments seeded');
  console.log('[Seed] Database seeding completed successfully! ✨');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
