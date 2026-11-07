/**
 * Cinnamon Velifushi Maldives — Island Concierge Chatbot ("Veli")
 * Provides instant, intelligent answers to guest queries about dining,
 * menus, packages, today's activities, spa, excursions, and resort services.
 */

(function () {
  'use strict';

  /* =====================================================================
     1. KNOWLEDGE BASE & INTENT ENGINE
     ===================================================================== */

  function getResortInfo() {
    const cfg = (typeof RESORT !== 'undefined' ? RESORT : (window.RESORT || {}));
    return {
      name: cfg.name || "Cinnamon Velifushi Maldives",
      atoll: cfg.tagline || "Vaavu Atoll, Maldives",
      phone: cfg.phone || "+960 670 6000",
      email: cfg.email || "velifushi@cinnamonhotels.com",
      whatsapp: cfg.whatsapp || "",
      website: cfg.website || "https://www.cinnamonhotels.com/cinnamonvelifushimaldives",
      receptionExt: "650 or 666",
      emergencyExt: "0 (Service Centre)",
      checkoutTime: "12:00 PM (Noon)",
      wifi: "Complimentary high-speed Wi-Fi is available across the entire island and in all villas. For assistance, dial Ext 650.",
      doctor: "Resident doctor on call 24 hours. Contact Reception on Ext 666 or 650.",
      laundry: "Collected before 10:00 AM for same-day delivery. Laundry after 10:00 AM is delivered the next evening. Same-day express incurs a 50% surcharge.",
      drones: "For guest privacy and safety due to seaplane operations, drones are strictly prohibited on the island.",
      prayerRoom: "Islamic Prayer Room is available on the island. Prayer mats and Holy Quran can be requested via Housekeeping.",
      spaHours: "10:00 AM – 1:00 PM | 2:00 PM – 8:00 PM (Last booking at 7:00 PM)",
      diveHours: "8:00 AM – 12:00 PM | 2:00 PM – 5:00 PM",
      seaplane: "Velifushi is located in Vaavu Atoll, just a scenic 25-minute seaplane flight from Velana International Airport (Malé). Standard seaplane baggage allowance is 20 kg check-in + 5 kg carry-on.",
      currency: "All resort transactions are quoted in US Dollars (USD). Major credit cards (Visa, MasterCard, Amex) are accepted at checkout. Foreign currency exchange is available at Reception (Ext 650)."
    };
  }

  const DINING_VENUES = [
    {
      name: "Vah Global Dining",
      type: "Main Buffet Restaurant",
      desc: "Daily international themed buffets with live cooking stations.",
      hours: "Breakfast: 7:30 AM – 10:00 AM<br>Lunch: 12:30 PM – 2:30 PM<br>Dinner: 7:00 PM – 9:30 PM",
      plan: "Included for BB, HB, FB, All-Inclusive & Soft All-Inclusive."
    },
    {
      name: "Iru Kitchen & Bar",
      type: "À la Carte & Cocktail Bar",
      desc: "Global flavours and snacks overlooking the turquoise lagoon.",
      hours: "Lunch: 12:30 PM – 4:30 PM<br>Dinner: 7:30 PM – 10:00 PM",
      plan: "All-Inclusive guests dine free (prior reservation required). Chargeable for non-AI."
    },
    {
      name: "Marlin Seafood Restaurant",
      type: "Specialty Seafood & Wine Bar",
      desc: "Fresh ocean catches and lobster specialties by the beach.",
      hours: "Dinner: 7:00 PM – 10:00 PM",
      plan: "Chargeable to all guests regardless of meal plan. Prior reservation required."
    },
    {
      name: "Fen Pool Bar",
      type: "Poolside Diner & Cocktails",
      desc: "À la carte poolside diner serving exotic drinks and light snacks.",
      hours: "Pool Menu: 11:00 AM – 4:00 PM<br>Snacks: 4:00 PM – 5:30 PM<br>Bar open until Midnight",
      plan: "Included for All-Inclusive & Soft All-Inclusive."
    },
    {
      name: "In-Room Dining",
      type: "Villa Dining & Champagne Breakfasts",
      desc: "Private dining delivered to your terrace or overwater villa.",
      hours: "8:00 AM – 11:30 PM (Last food order at 11:00 PM)",
      plan: "Chargeable on consumption. Dial Ext 650 or 666 to order."
    }
  ];

  /* Helper to format Maldives time */
  function getMaldivesDayName() {
    try {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: 'Indian/Maldives'
      }).format(new Date());
    } catch (e) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[new Date().getDay()];
    }
  }

  /* Extract today's activities & entertainment dynamically */
  function getTodaySchedule() {
    const today = getMaldivesDayName();
    let actHtml = "";
    let entHtml = "";

    if (window.CONTENT) {
      // Weekly Activities doc
      const actDoc = window.CONTENT["1Wq_R_jAfc4T5hKfC2_5rj5Ywj1z1jTBu"];
      if (actDoc && actDoc.blocks) {
        actDoc.blocks.forEach(b => {
          if (b.schedule && b.schedule.days) {
            const match = b.schedule.days.find(d => d[0].toLowerCase() === today.toLowerCase());
            if (match) {
              const times = b.schedule.times || ["Morning", "Afternoon"];
              const slot1 = (match[1] || []).map(x => x.replace(/\|/, ' – ')).join(", ");
              const slot2 = (match[2] || []).map(x => x.replace(/\|/, ' – ')).join(", ");
              if (slot1) actHtml += `<div><strong>${times[0]}:</strong> ${slot1}</div>`;
              if (slot2) actHtml += `<div><strong>${times[1]}:</strong> ${slot2}</div>`;
            }
          }
        });
      }

      // Weekly Entertainment doc
      const entDoc = window.CONTENT["1e-M6ZcV7hsaUQbsou82lkROJvxzCSJJk"];
      if (entDoc && entDoc.blocks) {
        entDoc.blocks.forEach(b => {
          if (b.schedule && b.schedule.days) {
            const match = b.schedule.days.find(d => d[0].toLowerCase() === today.toLowerCase());
            if (match) {
              const times = b.schedule.times || ["Sunset", "Night"];
              const slot1 = (match[1] || []).map(x => x.replace(/\|/, ' – ')).join(", ");
              const slot2 = (match[2] || []).map(x => x.replace(/\|/, ' – ')).join(", ");
              if (slot1) entHtml += `<div><strong>${times[0]}:</strong> ${slot1}</div>`;
              if (slot2) entHtml += `<div><strong>${times[1]}:</strong> ${slot2}</div>`;
            }
          }
        });
      }
    }

    return {
      day: today,
      activities: actHtml || "<em>Check weekly activities board at reception.</em>",
      entertainment: entHtml || "<em>Live entertainment scheduled at Fen Bar.</em>"
    };
  }

  /* Deep search through CONTENT for dishes, drinks, prices, and allergen tags */
  function searchContentItems(query) {
    if (!window.CONTENT) return [];
    const q = query.toLowerCase().trim();
    if (q.length < 3) return [];

    const results = [];
    const seen = new Set();

    for (const [docId, doc] of Object.entries(window.CONTENT)) {
      if (!doc.blocks) continue;
      const docTitle = (window.DOCS && window.DOCS[docId] && window.DOCS[docId].t) || "Resort Document";

      for (const block of doc.blocks) {
        if (block.i) {
          const itemText = block.i.toLowerCase();
          const descText = (block.d || []).join(' ').toLowerCase();

          if (itemText.includes(q) || descText.includes(q)) {
            const cleanName = block.i.replace(/\s*\{(\w+)\}/g, '');
            if (!seen.has(cleanName)) {
              seen.add(cleanName);
              const allergens = (block.i.match(/\{(\w+)\}/g) || []).map(m => m.replace(/[{}]/g, ''));
              results.push({
                name: cleanName,
                price: block.p || "",
                desc: (block.d && block.d[0]) || "",
                docId: docId,
                docTitle: docTitle,
                allergens: allergens
              });
            }
          }
        }
        if (results.length >= 6) break;
      }
      if (results.length >= 6) break;
    }
    return results;
  }

  /* Core response generator */
  function getBotResponse(rawText) {
    const text = rawText.toLowerCase().trim();
    const info = getResortInfo();

    // Helper: default contact action
    const contactAction = info.whatsapp
      ? { text: "💬 WhatsApp Team", url: `https://wa.me/${info.whatsapp}` }
      : { text: "📞 Call Reception", url: `tel:${info.phone.replace(/\s/g, '')}` };

    // 1. Greetings
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|hola|aloha|ayubowan|assalamu\s*alaikum)\b/.test(text)) {
      return {
        reply: `Hello and warm greetings from <strong>${info.name}</strong>! 🌴✨<br><br>I am <strong>Veli</strong>, your digital Island Concierge. How can I assist you in making the most of your Maldivian stay today?`,
        actions: [
          { text: "🍽️ Dining Timings", query: "dining timings" },
          { text: "📅 Today's Schedule", query: "today schedule" },
          { text: "🍹 All-Inclusive Perks", query: "all inclusive package" },
          { text: "💆 Mandara Spa", query: "spa treatments" }
        ]
      };
    }

    // 2. Thank you
    if (/^(thank|thanks|great|awesome|perfect|appreciate)\b/.test(text)) {
      return {
        reply: `You are very welcome! ✨ It is our absolute pleasure to take care of you. Please let me know whenever you need anything else!`,
        actions: [
          { text: "🗺️ Resort Map", url: "#/map" },
          contactAction
        ]
      };
    }

    // 2b. Gallery & Photos
    if (/(photo|photos|picture|pictures|gallery|image|images|scenery)/.test(text)) {
      return {
        reply: `📸 <strong>Cinnamon Velifushi Island Gallery:</strong><br><br>
        Take a visual tour across our paradise! Explore high-resolution captures of our aerial views, overwater villas, Mandara Spa, dolphin safaris, and beachfront dining.`,
        actions: [
          { text: "🖼️ View Island Gallery", url: "#/gallery" },
          { text: "🗺️ View Resort Map", url: "#/map" }
        ]
      };
    }

    // 3. Today's Activities & Entertainment
    if (/(today|schedule|activity|activities|entertainment|events|happening|dj|live\s*band|karaoke|zumba|cinema)/.test(text)) {
      const sched = getTodaySchedule();
      return {
        reply: `🌴 <strong>Today's Island Schedule (${sched.day}):</strong><br><br>
                <strong>🎯 Activities:</strong><br>${sched.activities}<br><br>
                <strong>✨ Evening Entertainment:</strong><br>${sched.entertainment}<br><br>
                <em>Timings may vary slightly depending on weather conditions.</em>`,
        actions: [
          { text: "📅 Full Week Activities", url: "#/activities" },
          { text: "🗺️ Resort Map", url: "#/map" }
        ]
      };
    }

    // 4. Restaurant Timings & Venues
    if (/(breakfast|lunch|dinner|buffet|restaurant|timing|hours|where\s*to\s*eat|food|dine|dining|opening\s*hours)/.test(text)) {
      let diningHtml = `🍽️ <strong>Cinnamon Velifushi Dining Venues:</strong><br><br>`;
      DINING_VENUES.forEach(v => {
        diningHtml += `<strong>${v.name}</strong> (${v.type})<br>${v.hours}<br><span style="font-size:12px;color:var(--cinnamon);">${v.plan}</span><br><br>`;
      });

      return {
        reply: diningHtml + `<em>Tip: In-Room Dining is available from 8:00 AM – 11:30 PM (dial Ext 650/666).</em>`,
        actions: [
          { text: "📖 Browse Menus", url: "#/menus" },
          { text: "🦞 Destination Dining", url: "#/special" }
        ]
      };
    }

    // 5. All-Inclusive & Soft All-Inclusive
    if (/(all[-\s]*inclusive|soft\s*all[-\s]*inclusive|ai\s*package|meal\s*plan|included|drinks\s*included|cocktail|beer|wine|minibar|mini\s*bar)/.test(text)) {
      return {
        reply: `🍹 <strong>All-Inclusive (AI) Package Highlights:</strong><br><br>
        • <strong>Valid Hours:</strong> 7:30 AM – Midnight (Alcohol served 9:00 AM onwards).<br>
        • <strong>Meals:</strong> Daily Breakfast, Lunch & Dinner buffets at <em>Vah Global Dining</em>, plus poolside snacks at <em>Fen Pool Bar</em>.<br>
        • <strong>À la Carte Dinner:</strong> Free dinner at <em>Iru Kitchen</em> (prior reservation required).<br>
        • <strong>Beverages:</strong> Draft beer, regular house wines by the glass, spirits, cocktails, mocktails, seasonal juices, milkshakes & soft drinks.<br>
        • <strong>In-Villa Mini Bar:</strong> Soft drinks & canned beer refilled once daily.<br>
        • <strong>Excursion:</strong> Choice of <em>Sunset Fishing</em> OR <em>Dolphin Watching</em> included!<br>
        • <strong>Recreation:</strong> Complimentary snorkelling gear & non-motorised water sports.<br><br>
        <em>Note: Marlin Seafood Restaurant, Room Service, champagne, and motorized water sports/diving are chargeable.</em>`,
        actions: [
          { text: "📜 All-Inclusive Details", url: "#/packages" },
          { text: "🍷 Beverage Lists", url: "#/packages" }
        ]
      };
    }

    // 6. Mandara Spa & Massages
    if (/(spa|massage|mandara|facial|scrub|body\s*glow|wellness|relax|elemis|treatment)/.test(text)) {
      return {
        reply: `🌺 <strong>Mandara Spa at Velifushi:</strong><br><br>
        Set above the turquoise waters, Mandara Spa blends ancient Balinese healing traditions with luxury <strong>ELEMIS</strong> skincare.<br><br>
        • <strong>Hours:</strong> ${info.spaHours}.<br>
        • <strong>Signature Treatments:</strong> Mandara 4-Hand Massage, Balinese Massage, Frangipani Body Glow, Elemis Pro-Glow Facials.<br>
        • <strong>✨ Fresh on Arrival Offer:</strong> Enjoy <strong>15% OFF</strong> on spa treatments plus a <strong>complimentary 5-minute welcome massage voucher</strong> with refreshing ginger tea!<br><br>
        Dial Ext 650 from your room phone to reserve your relaxation time.`,
        actions: [
          { text: "💆 View Full Spa Menu", url: "#/spa" },
          contactAction
        ]
      };
    }

    // 7. Diving, Water Sports & Excursions
    if (/(dive|diving|padi|shark|nurse\s*shark|snorkel|snorkelling|water\s*sport|jet\s*ski|parasail|kayak|fishing|dolphin|sandbank|excursion|boat|cruise|reef)/.test(text)) {
      return {
        reply: `🌊 <strong>Ocean Adventures & Excursions:</strong><br><br>
        • <strong>Dive & Sail Centre:</strong> Open daily ${info.diveHours}. Access to 25 dive sites in Vaavu Atoll (famed for nurse sharks & manta rays), PADI courses, night diving & daily <em>free try dives</em> in the lagoon.<br>
        • <strong>Water Sports:</strong> Jet skiing, parasailing, fun tubing, kayaking, stand-up paddleboarding, and catamaran rides.<br>
        • <strong>Signature Excursions:</strong><br>
          – 🐬 <strong>Dolphin Watching:</strong> Morning or afternoon dolphin cruise.<br>
          – 🎣 <strong>Sunset Fishing & Big Game Fishing:</strong> Reel in tuna, wahoo or reef fish.<br>
          – 🏝️ <strong>Sandbank Picnic:</strong> Private castaway experience on pure white sand.<br>
          – 🏘️ <strong>Local Village Tour (Thinadhoo):</strong> Discover Maldivian island culture.<br><br>
        <em>All-Inclusive guests enjoy 1 free excursion (Sunset Fishing or Dolphin Watching)!</em>`,
        actions: [
          { text: "🌴 Island Experiences", url: "#/island" },
          { text: "🗺️ Dive Centre Map", url: "#/map" }
        ]
      };
    }

    // 8. Wi-Fi, Internet & Connectivity
    if (/(wifi|wi-fi|internet|connection|password|network|online)/.test(text)) {
      return {
        reply: `📶 <strong>Wi-Fi Information:</strong><br><br>
        ${info.wifi}<br><br>
        Simply select the resort guest Wi-Fi network and follow the on-screen prompt to connect. No login code is required.`,
        actions: [
          { text: "📞 Tech Support (Ext 650)", url: `tel:${info.phone.replace(/\s/g, '')}` }
        ]
      };
    }

    // 9. Check-in / Check-out & Departures
    if (/(check\s*out|checkout|departure|leaving|flight|check\s*in|bill|settle|reception)/.test(text)) {
      return {
        reply: `🛎️ <strong>Check-Out & Departure Information:</strong><br><br>
        • <strong>Check-Out Time:</strong> <strong>${info.checkoutTime}</strong>.<br>
        • <strong>Departure Notification:</strong> Detailed transfer timings (boat/seaplane) will be delivered to your villa after 6:00 PM on the evening prior to departure.<br>
        • <strong>Baggage Assistance:</strong> Dial Ext 666 when your luggage is packed and ready.<br>
        • <strong>All-Inclusive Extension:</strong> AI entitlements remain valid until standard checkout at 12:00 PM noon.`,
        actions: [
          { text: "📞 Contact Reception", url: `tel:${info.phone.replace(/\s/g, '')}` }
        ]
      };
    }

    // 10. Medical / Doctor / Clinic
    if (/(doctor|medical|clinic|nurse|medicine|sick|hospital|injury|pharmacy|first\s*aid)/.test(text)) {
      return {
        reply: `🏥 <strong>Medical Assistance:</strong><br><br>
        A qualified resident doctor is <strong>on call 24 hours a day</strong> at Cinnamon Velifushi Maldives.<br><br>
        If you feel unwell or require medical care, please call <strong>Ext 666 or 650</strong> from your room phone immediately.<br>
        <em>For urgent emergencies, dial <strong>0</strong>.</em>`,
        actions: [
          { text: "🚨 Emergency Call (Reception)", url: `tel:${info.phone.replace(/\s/g, '')}` }
        ]
      };
    }

    // 11. Dietary / Halal / Allergens / Vegan / Gluten-free
    if (/(dietary|allergen|gluten|celery|nuts|vegan|vegetarian|dairy|pork|halal|kosher)/.test(text)) {
      return {
        reply: `🥗 <strong>Dietary & Allergen Information:</strong><br><br>
        We cater with care to all dietary preferences and requirements:<br>
        • <strong>Allergen Labels:</strong> Menu cards clearly indicate {gluten}, {dairy}, {vegetarian}, {nuts}, {pork}, {healthy}, etc.<br>
        • <strong>Halal Friendly:</strong> Meats served in buffet and dining outlets are Halal-certified (pork items are prepared and displayed separately).<br>
        • <strong>Custom Requests:</strong> Our culinary team is happy to prepare customized gluten-free, dairy-free, vegan or Jain meals.<br><br>
        <em>Please notify your server or contact our F&B team upon arrival so the Chef can meet with you directly.</em>`,
        actions: [
          { text: "📖 Browse Menus", url: "#/menus" },
          contactAction
        ]
      };
    }

    // 12. Seaplane, Transfers & Location
    if (/(seaplane|transfer|airport|male|distance|arrive|arrival|luggage|baggage\s*weight)/.test(text)) {
      return {
        reply: `✈️ <strong>Seaplane & Transfer Information:</strong><br><br>
        ${info.seaplane}<br><br>
        • <strong>Baggage Limits:</strong> Standard allowance is 20 kg checked luggage + 5 kg hand luggage per person (excess luggage charged by airline).<br>
        • <strong>Transfers:</strong> Seaplanes operate during daylight hours. Our airport representatives assist you from arrival at Malé directly to the Cinnamon seaplane lounge.`,
        actions: [
          contactAction
        ]
      };
    }

    // 13. Currency & Payment
    if (/(currency|cash|dollar|usd|credit\s*card|pay|bill|exchange|money|euro)/.test(text)) {
      return {
        reply: `💳 <strong>Currency & Payment:</strong><br><br>
        ${info.currency}<br><br>
        During your stay, all purchases can simply be signed to your room account and settled upon checkout. Advance payments on credit cards are not required.`,
        actions: [
          { text: "📞 Reception Desk", url: `tel:${info.phone.replace(/\s/g, '')}` }
        ]
      };
    }

    // 14. Honeymoon & Celebrations
    if (/(honeymoon|anniversary|birthday|celebrat|wedding|romantic)/.test(text)) {
      return {
        reply: `💍 <strong>Celebrations in Paradise:</strong><br><br>
        Whether celebrating a honeymoon, wedding anniversary or milestone birthday, we love creating unforgettable moments for you:<br>
        • <strong>Romantic Dining:</strong> Beachfront candlelit dinners, Lobster Lovers nights & Champagne breakfasts on your villa deck.<br>
        • <strong>Island Weddings:</strong> Renewal of vows and symbolic beach wedding ceremonies.<br>
        • <strong>Celebration Treats:</strong> Please alert our Guest Relations team so we can prepare special villa bed decorations and a celebration cake!`,
        actions: [
          { text: "⭐ Signature Experiences", url: "#/special" },
          { text: "💍 Wedding Packages", url: "#/wedding" }
        ]
      };
    }

    // 15. Drones, Safety & Policies
    if (/(drone|camera|safety|rule|coral|swim|smoking|smoke)/.test(text)) {
      return {
        reply: `🛡️ <strong>Island Safety & Policies:</strong><br><br>
        • <strong>Drones:</strong> Strictly prohibited across the entire island and airspace for guest privacy and seaplane operations.<br>
        • <strong>Coral Conservation:</strong> Corals are protected under Maldivian law. Please wear reef-safe sunscreen and avoid touching corals.<br>
        • <strong>Lagoon Safety:</strong> Always swim with a buddy and wear life vests in deep water. Night swimming is not recommended.<br>
        • <strong>Emergency:</strong> Dial <strong>0</strong> from your villa phone at any time.`,
        actions: [
          { text: "📖 Full Resort Compendium", url: "#/compendium" }
        ]
      };
    }

    // 16. Contact & Extensions
    if (/(contact|phone|call|extension|number|reception|email|reach|whatsapp)/.test(text)) {
      return {
        reply: `📞 <strong>Resort Contact Information:</strong><br><br>
        • <strong>Reception / Guest Service:</strong> Ext <strong>${info.receptionExt}</strong><br>
        • <strong>Emergency Service Centre:</strong> Ext <strong>${info.emergencyExt}</strong><br>
        • <strong>Telephone:</strong> ${info.phone}<br>
        • <strong>Email:</strong> ${info.email}<br>
        • <strong>Location:</strong> ${info.atoll}`,
        actions: [
          { text: "📞 Call Now", url: `tel:${info.phone.replace(/\s/g, '')}` },
          contactAction
        ]
      };
    }

    // 17. Deep Content & Menu Search
    const searchMatches = searchContentItems(text);
    if (searchMatches.length > 0) {
      let matchHtml = `🔍 <strong>Found in our Menus & Directory:</strong><br><br>`;
      searchMatches.forEach(item => {
        const allergenBadges = item.allergens.length
          ? ` <span style="font-size:11px;color:#7a4a12;background:#fbf1e2;border:1px solid #f0dcbc;padding:1px 5px;border-radius:10px;">${item.allergens.join(', ')}</span>`
          : '';
        matchHtml += `• <strong>${item.name}</strong> ${item.price ? `– <span style="color:var(--cinnamon);font-weight:600;">${item.price}</span>` : ''}${allergenBadges}<br>`;
        if (item.desc) matchHtml += `<span style="font-size:12.5px;color:var(--muted);">${item.desc}</span><br>`;
        matchHtml += `<a href="#/doc/${item.docId}" style="font-size:11.5px;color:var(--cinnamon);text-decoration:underline;display:inline-block;margin-bottom:6px;">View in ${item.docTitle} →</a><br><br>`;
      });

      return {
        reply: matchHtml,
        actions: [
          { text: "📖 Browse All Menus", url: "#/menus" },
          { text: "🍷 Beverage Lists", url: "#/packages" }
        ]
      };
    }

    // 18. Default Friendly Fallback
    return {
      reply: `I would love to help you with that! 😊<br><br>
      You can ask me anything about:<br>
      • <strong>Dining & Menus:</strong> Buffet hours, Iru Kitchen, Marlin Seafood, wine lists.<br>
      • <strong>Today's Schedule:</strong> Live activities & evening entertainment.<br>
      • <strong>Packages:</strong> Inclusions under All-Inclusive.<br>
      • <strong>Mandara Spa:</strong> Massages, Elemis facials & 15% welcome discount.<br>
      • <strong>Ocean Tours:</strong> Diving, dolphin cruises, sandbank picnics & fishing.<br>
      • <strong>Resort Services:</strong> Wi-Fi, 24h doctor, checkout at 12 noon, room extensions.<br><br>
      Or dial <strong>Ext 650</strong> from your villa to speak directly with our team!`,
      actions: [
        { text: "🍽️ Dining Timings", query: "dining timings" },
        { text: "📅 Today's Schedule", query: "today schedule" },
        { text: "🍹 All-Inclusive", query: "all inclusive" },
        contactAction
      ]
    };
  }

  /* =====================================================================
     2. STYLES
     ===================================================================== */
  const STYLES = `
    /* Floating Launcher Button */
    #veli-chat-badge {
      position: fixed;
      right: 18px;
      bottom: calc(72px + var(--safeB, 0px));
      z-index: 55;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    #veli-chat-badge:hover {
      transform: translateY(-2px);
    }
    #veli-chat-badge:active {
      transform: scale(0.95);
    }

    .veli-badge-btn {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: linear-gradient(135deg, #252776 0%, #1a1b57 100%);
      box-shadow: 0 4px 18px rgba(37, 39, 118, 0.38), 0 0 0 1px rgba(184, 182, 227, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      position: relative;
    }
    .veli-badge-btn svg {
      width: 25px;
      height: 25px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .veli-badge-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #10b981;
      border: 2px solid #ffffff;
      border-radius: 50%;
    }
    .veli-badge-chip {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(10px);
      color: #1c1c3c;
      font-size: 12px;
      font-weight: 500;
      padding: 7px 12px;
      border-radius: 18px;
      border: 1px solid #e3e3ef;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      letter-spacing: 0.02em;
      white-space: nowrap;
      animation: veliPulse 3s infinite;
    }
    @keyframes veliPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }

    /* Modal / Window */
    #veli-chat-modal {
      position: fixed;
      right: 18px;
      bottom: calc(76px + var(--safeB, 0px));
      width: 375px;
      max-width: calc(100vw - 36px);
      height: 580px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(23, 24, 63, 0.22), 0 0 0 1px rgba(37, 39, 118, 0.08);
      display: flex;
      flex-direction: column;
      z-index: 70;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(0.96);
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #veli-chat-modal.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    /* Header */
    .veli-header {
      background: linear-gradient(135deg, #252776 0%, #17183f 100%);
      color: #ffffff;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .veli-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .veli-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(184, 182, 227, 0.4);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .veli-avatar img {
      width: 22px;
      height: 22px;
      object-fit: contain;
    }
    .veli-title h4 {
      font-family: var(--serif, Georgia, serif);
      font-size: 17px;
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1.2;
    }
    .veli-title span {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #b8b6e3;
      letter-spacing: 0.04em;
    }
    .veli-status-dot {
      width: 7px;
      height: 7px;
      background: #10b981;
      border-radius: 50%;
    }
    .veli-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .veli-btn-icon {
      background: none;
      border: none;
      color: #ecebf7;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      transition: background 0.2s, color 0.2s;
    }
    .veli-btn-icon:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    .veli-btn-icon svg {
      width: 17px;
      height: 17px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Messages Stream */
    .veli-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      background: #f8f8fc;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .veli-msg {
      max-width: 86%;
      display: flex;
      flex-direction: column;
      gap: 4px;
      animation: veliMsgFade 0.25s ease both;
    }
    @keyframes veliMsgFade {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }
    .veli-msg.bot {
      align-self: flex-start;
    }
    .veli-msg.user {
      align-self: flex-end;
    }

    .veli-bubble {
      padding: 11px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.48;
      word-break: break-word;
    }
    .veli-msg.bot .veli-bubble {
      background: #ffffff;
      color: #1c1c3c;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px #e8e8f2;
    }
    .veli-msg.user .veli-bubble {
      background: #252776;
      color: #ffffff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 8px rgba(37, 39, 118, 0.25);
    }
    .veli-time {
      font-size: 10px;
      color: #9b9ab8;
      padding: 0 4px;
    }
    .veli-msg.user .veli-time {
      align-self: flex-end;
    }

    /* Action Buttons in bot responses */
    .veli-quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }
    .veli-action-btn {
      font-family: inherit;
      font-size: 11.5px;
      font-weight: 500;
      color: #252776;
      background: #f1f0fa;
      border: 1px solid #dcdbf5;
      padding: 6px 11px;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: background 0.2s, transform 0.15s;
    }
    .veli-action-btn:hover {
      background: #e5e3f7;
      transform: translateY(-1px);
    }
    .veli-action-btn:active {
      transform: scale(0.96);
    }

    /* Typing indicator */
    .veli-typing {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: #ffffff;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      border: 1px solid #e8e8f2;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      width: fit-content;
    }
    .veli-typing span {
      width: 6px;
      height: 6px;
      background: #8b8aa8;
      border-radius: 50%;
      animation: veliBounce 1.2s infinite ease-in-out both;
    }
    .veli-typing span:nth-child(1) { animation-delay: -0.32s; }
    .veli-typing span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes veliBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    /* Suggestion Chips Bar */
    .veli-chips-bar {
      padding: 8px 12px;
      background: #ffffff;
      border-top: 1px solid #eeeeff;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      flex-shrink: 0;
    }
    .veli-chips-bar::-webkit-scrollbar {
      display: none;
    }
    .veli-chip {
      font-family: inherit;
      font-size: 11.5px;
      white-space: nowrap;
      padding: 5px 11px;
      border-radius: 14px;
      background: #f6f6fb;
      border: 1px solid #e3e3ef;
      color: #252776;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .veli-chip:hover {
      background: #252776;
      color: #ffffff;
      border-color: #252776;
    }

    /* Input Footer */
    .veli-footer {
      padding: 10px 12px calc(10px + var(--safeB, 0px));
      background: #ffffff;
      border-top: 1px solid #e8e8f2;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .veli-input {
      flex: 1;
      border: 1px solid #dcdbf5;
      border-radius: 20px;
      padding: 10px 14px;
      font-family: inherit;
      font-size: 13.5px;
      color: #1c1c3c;
      background: #fbfbfe;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .veli-input:focus {
      border-color: #252776;
      box-shadow: 0 0 0 3px rgba(37, 39, 118, 0.1);
      background: #ffffff;
    }
    .veli-input::placeholder {
      color: #9b9ab8;
    }

    .veli-mic-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #f1f0fa;
      border: 1px solid #dcdbf5;
      color: #252776;
      display: grid;
      place-items: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.2s, color 0.2s;
    }
    .veli-mic-btn.listening {
      background: #ef4444;
      color: #ffffff;
      border-color: #ef4444;
      animation: veliPulse 1.2s infinite;
    }
    .veli-mic-btn svg {
      width: 17px;
      height: 17px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .veli-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #252776;
      border: none;
      color: #ffffff;
      display: grid;
      place-items: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.2s, background 0.2s;
    }
    .veli-send-btn:hover {
      background: #1a1b57;
      transform: scale(1.05);
    }
    .veli-send-btn:active {
      transform: scale(0.92);
    }
    .veli-send-btn svg {
      width: 17px;
      height: 17px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Mobile fullscreen / bottom sheet adaptation */
    @media (max-width: 480px) {
      #veli-chat-badge {
        bottom: calc(68px + var(--safeB, 0px));
        right: 14px;
      }
      .veli-badge-chip {
        display: none;
      }
      #veli-chat-modal {
        right: 0;
        bottom: 0;
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        max-height: 100dvh;
        border-radius: 0;
        z-index: 100;
      }
      .veli-header {
        padding-top: max(14px, env(safe-area-inset-top));
      }
    }
  `;

  /* =====================================================================
     3. DOM CREATION & UI LOGIC
     ===================================================================== */

  function injectChatbot() {
    function getCurrentTime() {
      const d = new Date();
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Inject Styles
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    // Initial Messages in storage or default
    let chatHistory = [];
    try {
      const saved = sessionStorage.getItem('veli_chat_history');
      if (saved) chatHistory = JSON.parse(saved);
    } catch (e) {}

    // Default welcome message if empty
    if (!chatHistory.length) {
      chatHistory.push({
        sender: 'bot',
        text: `Welcome to <strong>Cinnamon Velifushi Maldives</strong>! 🌴✨<br><br>I am <strong>Veli</strong>, your island virtual concierge. Tap any quick option below or ask me about dining, packages, today's entertainment, spa, or resort services!`,
        time: getCurrentTime(),
        actions: [
          { text: "🍽️ Dining Timings", query: "dining timings" },
          { text: "📅 Today's Schedule", query: "today schedule" },
          { text: "🍹 All-Inclusive Drinks", query: "all inclusive package" },
          { text: "💆 Mandara Spa", query: "spa menu" }
        ]
      });
    }

    // Floating Badge
    const badge = document.createElement('div');
    badge.id = 'veli-chat-badge';
    badge.setAttribute('aria-label', 'Open Island Concierge Chat');
    badge.innerHTML = `
      <div class="veli-badge-chip">Ask Island Concierge</div>
      <div class="veli-badge-btn">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="veli-badge-dot"></span>
      </div>
    `;

    // Modal
    const modal = document.createElement('div');
    modal.id = 'veli-chat-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Cinnamon Velifushi Island Concierge');
    modal.innerHTML = `
      <div class="veli-header">
        <div class="veli-profile">
          <div class="veli-avatar">
            <img src="img/logo-flower.png" alt="Cinnamon">
          </div>
          <div class="veli-title">
            <h4>Veli · Island Concierge</h4>
            <span><span class="veli-status-dot"></span> Online · Cinnamon Velifushi</span>
          </div>
        </div>
        <div class="veli-actions">
          <button class="veli-btn-icon" id="veli-clear-btn" title="Reset Conversation" aria-label="Reset Conversation">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          <button class="veli-btn-icon" id="veli-close-btn" title="Close" aria-label="Close Chat">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <div class="veli-messages" id="veli-messages-container"></div>

      <div class="veli-chips-bar">
        <button class="veli-chip" data-q="restaurant timings">🍽️ Dining Timings</button>
        <button class="veli-chip" data-q="today activities">📅 Today's Events</button>
        <button class="veli-chip" data-q="all inclusive drinks">🍹 All-Inclusive Drinks</button>
        <button class="veli-chip" data-q="spa treatments">💆 Mandara Spa</button>
        <button class="veli-chip" data-q="dolphin excursion">🐬 Excursions</button>
        <button class="veli-chip" data-q="wifi info">📶 Wi-Fi</button>
        <button class="veli-chip" data-q="checkout time">🛎️ Check-Out</button>
        <button class="veli-chip" data-q="reception contact">📞 Call Reception</button>
      </div>

      <div class="veli-footer">
        <input type="text" class="veli-input" id="veli-user-input" placeholder="Ask about menus, spa, activities..." aria-label="Message Island Concierge">
        <button class="veli-mic-btn" id="veli-mic-btn" title="Voice input" aria-label="Voice input" style="display:none">
          <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
        </button>
        <button class="veli-send-btn" id="veli-send-btn" aria-label="Send message">
          <svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
    `;

    document.body.appendChild(badge);
    document.body.appendChild(modal);

    const msgContainer = document.getElementById('veli-messages-container');
    const input = document.getElementById('veli-user-input');
    const sendBtn = document.getElementById('veli-send-btn');
    const micBtn = document.getElementById('veli-mic-btn');
    const closeBtn = document.getElementById('veli-close-btn');
    const clearBtn = document.getElementById('veli-clear-btn');

    // Speech Recognition Support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (SpeechRecognition) {
      micBtn.style.display = 'grid';
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => micBtn.classList.add('listening');
      recognition.onend = () => micBtn.classList.remove('listening');
      recognition.onerror = () => micBtn.classList.remove('listening');
      recognition.onresult = e => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          input.value = transcript;
          handleSend();
        }
      };

      micBtn.addEventListener('click', () => {
        if (micBtn.classList.contains('listening')) {
          recognition.stop();
        } else {
          try { recognition.start(); } catch (err) {}
        }
      });
    }

    // Render message stream
    function renderMessages() {
      msgContainer.innerHTML = '';
      chatHistory.forEach(msg => {
        const row = document.createElement('div');
        row.className = `veli-msg ${msg.sender}`;

        let actionButtonsHtml = "";
        if (msg.actions && msg.actions.length) {
          actionButtonsHtml = `<div class="veli-quick-actions">` +
            msg.actions.map(act => {
              if (act.url) {
                return `<a href="${act.url}" class="veli-action-btn">${act.text}</a>`;
              } else {
                return `<button type="button" class="veli-action-btn" data-query="${act.query}">${act.text}</button>`;
              }
            }).join('') +
          `</div>`;
        }

        row.innerHTML = `
          <div class="veli-bubble">${msg.text}</div>
          ${actionButtonsHtml}
          <span class="veli-time">${msg.time || ''}</span>
        `;
        msgContainer.appendChild(row);
      });

      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // Save to session
    function saveHistory() {
      try {
        sessionStorage.setItem('veli_chat_history', JSON.stringify(chatHistory));
      } catch (e) {}
    }

    // Send user message
    function handleSend(customText) {
      const q = (customText || input.value).trim();
      if (!q) return;

      chatHistory.push({
        sender: 'user',
        text: q,
        time: getCurrentTime()
      });
      input.value = '';
      renderMessages();
      saveHistory();

      // Typing indicator
      const typingEl = document.createElement('div');
      typingEl.className = 'veli-msg bot';
      typingEl.innerHTML = `<div class="veli-typing"><span></span><span></span><span></span></div>`;
      msgContainer.appendChild(typingEl);
      msgContainer.scrollTop = msgContainer.scrollHeight;

      // Realistic response delay
      setTimeout(() => {
        if (typingEl.parentNode) typingEl.remove();

        const responseObj = getBotResponse(q);
        chatHistory.push({
          sender: 'bot',
          text: responseObj.reply,
          actions: responseObj.actions || [],
          time: getCurrentTime()
        });
        renderMessages();
        saveHistory();
      }, 400);
    }

    // Toggle Modal
    function toggleChat(open) {
      const isOpen = modal.classList.contains('open');
      const shouldOpen = open !== undefined ? open : !isOpen;
      modal.classList.toggle('open', shouldOpen);

      if (shouldOpen) {
        renderMessages();
        setTimeout(() => input.focus(), 150);
      }
    }

    // Event Listeners
    badge.addEventListener('click', () => toggleChat(true));
    closeBtn.addEventListener('click', () => toggleChat(false));

    sendBtn.addEventListener('click', () => handleSend());
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });

    clearBtn.addEventListener('click', () => {
      if (confirm('Start a fresh conversation with Island Concierge?')) {
        chatHistory = [];
        try { sessionStorage.removeItem('veli_chat_history'); } catch (e) {}
        chatHistory.push({
          sender: 'bot',
          text: `Conversation restarted. How can I assist you today, islander? 🌴`,
          time: getCurrentTime(),
          actions: [
            { text: "🍽️ Dining Timings", query: "dining timings" },
            { text: "📅 Today's Schedule", query: "today schedule" },
            { text: "🍹 All-Inclusive Perks", query: "all inclusive" },
            { text: "🗺️ Resort Map", url: "#/map" }
          ]
        });
        renderMessages();
        saveHistory();
      }
    });

    // Chips bar clicks
    document.querySelector('.veli-chips-bar').addEventListener('click', e => {
      const chip = e.target.closest('.veli-chip');
      if (chip && chip.dataset.q) {
        handleSend(chip.dataset.q);
      }
    });

    // Dynamic button clicks inside chat (for query buttons)
    msgContainer.addEventListener('click', e => {
      const btn = e.target.closest('button[data-query]');
      if (btn && btn.dataset.query) {
        handleSend(btn.dataset.query);
        return;
      }
      const link = e.target.closest('a[href^="#/"]');
      if (link && window.innerWidth <= 480) {
        toggleChat(false);
      }
    });

    // Global hook so any button on the page can open chat
    window.openIslandConcierge = function (prompt) {
      toggleChat(true);
      if (prompt) {
        handleSend(prompt);
      }
    };

    renderMessages();
  }

  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatbot);
  } else {
    injectChatbot();
  }
})();
