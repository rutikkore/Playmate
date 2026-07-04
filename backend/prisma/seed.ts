import { PrismaClient, Role, VerificationStatus, SlotStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Seed Sports
  const sportsData = [
    { name: "Football", slug: "football", icon: "soccer" },
    { name: "Badminton", slug: "badminton", icon: "shuttlecock" },
    { name: "Cricket", slug: "cricket", icon: "cricket-bat" },
    { name: "Tennis", slug: "tennis", icon: "tennis-racket" },
    { name: "Basketball", slug: "basketball", icon: "basketball-hoop" },
  ];

  const sportsMap: Record<string, any> = {};
  for (const item of sportsData) {
    const s = await prisma.sport.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
    sportsMap[item.name] = s;
  }
  console.log(`Seeded ${Object.keys(sportsMap).length} sports.`);

  // 2. Find or Create Demo Provider User
  let providerUser = await prisma.user.findFirst({
    where: { role: Role.PROVIDER },
  });

  if (!providerUser) {
    providerUser = await prisma.user.create({
      data: {
        firebaseUid: "demo-provider-uid",
        email: "provider@playmate.com",
        name: "Demo Provider",
        role: Role.PROVIDER,
        emailVerified: true,
      },
    });
  }

  // 3. Create or Get Provider Profile
  let providerProfile = await prisma.providerProfile.findUnique({
    where: { userId: providerUser.id },
  });

  if (!providerProfile) {
    providerProfile = await prisma.providerProfile.create({
      data: {
        userId: providerUser.id,
        businessName: "Green Arena Sports Ltd",
        contactPhone: "+919876543210",
        verificationStatus: VerificationStatus.APPROVED,
      },
    });
  }
  console.log(`Seeded Provider profile for: ${providerProfile.businessName}`);

  // 4. Seed Turfs
  const turfsData = [
    {
      name: "Green Arena 5-a-side",
      location: "Koramangala, Bangalore",
      pricePerHour: 1200,
      courts: 2,
      status: "active",
      images: ["turf-1.jpg"],
      sportName: "Football",
    },
    {
      name: "Shuttle Zone Pro",
      location: "HSR Layout, Bangalore",
      pricePerHour: 800,
      courts: 4,
      status: "active",
      images: ["turf-2.jpg"],
      sportName: "Badminton",
    },
    {
      name: "Pitch Perfect Nets",
      location: "Indiranagar, Bangalore",
      pricePerHour: 1500,
      courts: 3,
      status: "inactive",
      images: ["turf-3.jpg"],
      sportName: "Cricket",
    },
    {
      name: "Ace Tennis Academy",
      location: "Whitefield, Bangalore",
      pricePerHour: 1000,
      courts: 1,
      status: "active",
      images: ["turf-4.jpg"],
      sportName: "Tennis",
    },
    {
      name: "Goal Rush Arena",
      location: "JP Nagar, Bangalore",
      pricePerHour: 1100,
      courts: 2,
      status: "active",
      images: ["turf-1.jpg"],
      sportName: "Football",
    },
    {
      name: "Smash Court",
      location: "Marathahalli, Bangalore",
      pricePerHour: 700,
      courts: 2,
      status: "active",
      images: ["turf-2.jpg"],
      sportName: "Badminton",
    },
  ];

  const seededTurfs = [];
  for (const item of turfsData) {
    const existing = await prisma.turf.findFirst({
      where: { name: item.name, providerId: providerProfile.id },
    });

    let turf;
    if (existing) {
      turf = existing;
    } else {
      turf = await prisma.turf.create({
        data: {
          name: item.name,
          location: item.location,
          pricePerHour: item.pricePerHour,
          courts: item.courts,
          status: item.status,
          images: item.images,
          providerId: providerProfile.id,
        },
      });

      // Link to Sport via TurfSport
      const sport = sportsMap[item.sportName];
      if (sport) {
        await prisma.turfSport.create({
          data: {
            turfId: turf.id,
            sportId: sport.id,
          },
        });
      }
    }
    seededTurfs.push(turf);
  }
  console.log(`Seeded ${seededTurfs.length} turfs.`);

  // 5. Seed Availability Slots (Feb 10 to Feb 16, 2026)
  const timeSlots = [
    "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
    "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
  ];

  console.log("Seeding availability slots...");
  for (const turf of seededTurfs) {
    // Generate slots for each date: Feb 10, 11, 12, 13, 14, 15, 16 of 2026
    for (let day = 10; day <= 16; day++) {
      const dateString = `2026-02-${day}T00:00:00.000Z`;
      const date = new Date(dateString);

      for (const time of timeSlots) {
        // Parse time to calculate end time (1 hour duration)
        const [hourStr, modifier] = time.split(" ");
        let [hours, minutes] = hourStr.split(":").map(Number);
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        
        let endHours = hours + 1;
        let endModifier = "AM";
        if (endHours >= 12) {
          endModifier = "PM";
          if (endHours > 12) endHours -= 12;
        } else if (endHours === 0) {
          endHours = 12;
        }
        const endTime = `${endHours}:00 ${endModifier}`;

        // Match initial mock blocked slots in the frontend
        // e.g. for "Green Arena 5-a-side" on Friday Feb 14, slot "11:00 AM" is BLOCKED
        let status: SlotStatus = SlotStatus.AVAILABLE;
        if (turf.name === "Green Arena 5-a-side" && day === 14 && time === "11:00 AM") {
          status = SlotStatus.BLOCKED;
        }

        await prisma.availabilitySlot.upsert({
          where: {
            turfId_date_startTime: {
              turfId: turf.id,
              date: date,
              startTime: time,
            },
          },
          update: {},
          create: {
            turfId: turf.id,
            date: date,
            startTime: time,
            endTime: endTime,
            status: status,
          },
        });
      }
    }
  }
  console.log("Seeded availability slots successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
