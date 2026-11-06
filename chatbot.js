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

  const RESORT_DATA = {
    name: "Cinnamon Velifushi Maldives",
    atoll: "Vaavu Atoll, Maldives",
    phone: "+960 670 6000",
    email: "velifushi@cinnamonhotels.com",
    whatsapp: "", // Can be filled with digits e.g. "9607000000"
    receptionExt: "650 or 666",
    emergencyExt: "0 (Service Centre)",
    checkoutTime: "12:00 PM (Noon)",
    wifi: "Complimentary high-speed Wi-Fi is available across the entire island and in all villas. For assistance, dial Ext 650.",
    doctor: "Resident doctor on call 24 hours. Contact Reception on Ext 666 or 650.",
    laundry: "Collected before 10:00 AM for same-day delivery. Laundry after 10:00 AM is delivered the next evening. Same-day express incurs a 50% surcharge.",
    drones: "For guest privacy and safety due to seaplane operations, drones are strictly prohibited on the island.",
    prayerRoom: "Islamic Prayer Room is available on the island. Prayer mats and Holy Quran can be requested via Housekeeping.",
    spaHours: "10:00 AM – 1:00 PM | 2:00 PM – 8:00 PM (Last booking at 7:00 PM)",
    diveHours: "8:00 AM – 12:00 PM | 2:00 PM – 5:00 PM"
  };

  const DINING_VENUES = [
    {
      name: "Vah Global Dining",
      type: "Main Buffet Restaurant",
      desc: "Serves daily international buffets with live cooking stations.",
      hours: "Breakfast: 7:30 AM – 10:00 AM<br>Lunch: 12:30 PM – 2:30 PM<br>Dinner: 7:00 PM – 9:30 PM",
      plan: "Included for BB, HB, FB, All-Inclusive & Soft All-Inclusive.",
      docId: null
    },
    {
      name: "Iru Kitchen & Bar",
      type: "À la Carte & Cocktail Bar",
      desc: "Flavours from all over the world with ocean views.",
      hours: "Lunch: 12:30 PM – 4:30 PM<br>Dinner: 7:30 PM – 10:00 PM",
      plan: "All-Inclusive guests dine free (prior reservation required). Chargeable for non-AI.",
      docId: "1CQ4_X9nN6nSGoCeBavgekDhHSxuGosbd"
    },
    {
      name: "Marlin Seafood Restaurant",
      type: "Specialty Seafood & Wine Bar",
      desc: "Irresistible seafood cuisine under the stars.",
      hours: "Dinner: 7:00 PM – 10:00 PM",
      plan: "Chargeable to all guests regardless of meal plan. Prior reservation required.",
      docId: "1kzzvnGOaXkl53C5DSd-CFTkmld5QYqn_"
    },
    {
      name: "Fen Pool Bar",
      type: "Poolside Diner & Cocktails",
      desc: "À la carte poolside bar serving exotic drinks and light bites.",
      hours: "Pool Menu: 11:00 AM – 4:00 PM<br>Snacks: 4:00 PM – 5:30 PM<br>Bar open until Midnight",
      plan: "Included for All-Inclusive & Soft All-Inclusive.",
      docId: null
    },
    {
      name: "In-Room Dining",
      type: "Villa Dining & Champagne Breakfasts",
      desc: "Private dining delivered to your terrace or overwater villa.",
      hours: "8:00 AM – 11:30 PM (Last food order at 11:00 PM)",
      plan: "Chargeable on consumption. Dial Ext 650 or 666 to order.",
      docId: "1LYwhnm_JNL2PzSBHKRXtBQKkZx836Nut"
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
        // Items (dishes, drinks, spa packages)
        if (block.i) {
          const itemText = block.i.toLowerCase();
          const descText = (block.d || []).join(' ').toLowerCase();

          if (itemText.includes(q) || descText.includes(q)) {
            const cleanName = block.i.replace(/\s*\{(\w+)\}/g, '');
            if (!seen.has(cleanName)) {
              seen.add(cleanName);
              // Extract allergens
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

    // 1. Greetings
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|hola|aloha|ayubowan|assalamu\s*alaikum)\b/.test(text)) {
      return {
        reply: `Hello and warm greetings from <strong>Cinnamon Velifushi Maldives</strong>! 🌴<br><br>I am <strong>Veli</strong>, your digital Island Concierge. How can I make your holiday even more wonderful today?`,
        actions: [
          { text: "🍽️ Dining & Timings", query: "dining timings" },
          { text: "📅 Today's Activities", query: "today schedule" },
          { text: "🍹 All-Inclusive Info", query: "all inclusive package" },
          { text: "💆 Mandara Spa", query: "spa treatments" }
        ]
      };
    }

    // 2. Thank you
    if (/^(thank|thanks|great|awesome|perfect|appreciate)\b/.test(text)) {
      return {
        reply: `You are very welcome! ✨ We are delighted to have you on the island. Please let me know if you need anything else!`,
        actions: [
          { text: "🗺️ View Resort Map", url: "#/map" },
          { text: "📞 Call Reception", url: "tel:+9606706000" }
        ]
      };
    }

    // 3. Today's Activities & Entertainment
    if (/(today|schedule|activity|activities|entertainment|events|happening|dj|live\s*band|karaoke|zumba|cinema)/.test(text)) {
      const sched = getTodaySchedule();
      return {
        reply: `🌴 <strong>Today's Island Schedule (${sched.day}):</strong><br><br>
                <strong>🎯 Activities:</strong><br>${sched.activities}<br>
                <strong>✨ Evening Entertainment:</strong><br>${sched.entertainment}<br><br>
                <em>Timings may vary slightly depending on weather conditions.</em>`,
        actions: [
          { text: "📅 Full Week Schedule", url: "#/activities" },
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
        • <strong>Valid Hours:</strong> 7:30 AM – Midnight (Alcohol served from 9:00 AM onwards).<br>
        • <strong>Meals:</strong> Breakfast, Lunch & Dinner buffet at <em>Vah Global Dining</em>, plus poolside snacks at <em>Fen Pool Bar</em>.<br>
        • <strong>À la Carte Dinner:</strong> Free dinner at <em>Iru Kitchen</em> (prior reservation required).<br>
        • <strong>Beverages:</strong> Draft beer, house wines by the glass, spirits, signature cocktails, mocktails, juices, milkshakes, and soft drinks.<br>
        • <strong>In-Villa Mini Bar:</strong> Soft drinks and canned beer, refilled once daily.<br>
        • <strong>Excursion:</strong> Choice of <em>Sunset Fishing</em> OR <em>Dolphin Watching</em> excursion included!<br>
        • <strong>Recreation:</strong> Complimentary snorkelling gear & non-motorised water sports.<br><br>
        <em>Note: Marlin Seafood Restaurant, Room Service, champagne, and motorized water sports/diving are chargeable.</em>`,
        actions: [
          { text: "📜 All-Inclusive Details", url: "#/packages" },
          { text: "🍷 Wine & Beverage List", url: "#/menus" }
        ]
      };
    }

    // 6. Mandara Spa & Massages
    if (/(spa|massage|mandara|facial|scrub|body\s*glow|wellness|relax|elemis|treatment)/.test(text)) {
      return {
        reply: `🌺 <strong>Mandara Spa at Velifushi:</strong><br><br>
        Located overwater, Mandara Spa combines ancient Balinese healing rituals with award-winning luxury <strong>ELEMIS</strong> skincare.<br><br>
        • <strong>Opening Hours:</strong> 10:00 AM – 1:00 PM & 2:00 PM – 8:00 PM (Last booking at 7:00 PM).<br>
        • <strong>Popular Treatments:</strong> Mandara Signature 4-Hand Massage, Balinese Massage, Frangipani Body Glow, Elemis Pro-Glow Facials.<br>
        • <strong>✨ Fresh on Arrival Offer:</strong> Enjoy <strong>15% OFF</strong> on spa treatments plus a <strong>complimentary 5-minute massage voucher</strong> with refreshing ginger tea!<br><br>
        Dial Ext 650 to book your treatment.`,
        actions: [
          { text: "💆 View Full Spa Menu", url: "#/spa" },
          { text: "📞 Contact Reception", url: "tel:+9606706000" }
        ]
      };
    }

    // 7. Diving, Water Sports & Excursions
    if (/(dive|diving|padi|snorkel|snorkelling|water\s*sport|jet\s*ski|parasail|kayak|fishing|dolphin|sandbank|excursion|boat|cruise|reef)/.test(text)) {
      return {
        reply: `🌊 <strong>Ocean Adventures & Excursions:</strong><br><br>
        • <strong>Dive & Sail Centre:</strong> Open daily 8:00 AM – 12:00 PM & 2:00 PM – 5:00 PM. Access to 25 prime dive sites, PADI courses, night diving & daily <em>free try dives</em> in the lagoon.<br>
        • <strong>Water Sports:</strong> Jet skiing, parasailing, fun tubing, kayaking, stand-up paddleboarding, and catamaran rides.<br>
        • <strong>Signature Excursions:</strong><br>
          – 🐬 <strong>Dolphin Watching:</strong> Morning or afternoon dolphin safari.<br>
          – 🎣 <strong>Sunset Fishing & Big Game Fishing:</strong> Catch reef fish or tuna/marlin.<br>
          – 🏝️ <strong>Sandbank Picnic:</strong> Private virgin sandbank escape.<br>
          – 🏘️ <strong>Local Village Tour (Thinadhoo):</strong> Experience authentic island life.<br><br>
        <em>All-Inclusive guests get 1 free excursion (Sunset Fishing or Dolphin Watching)!</em>`,
        actions: [
          { text: "🌴 Island Experiences", url: "#/island" },
          { text: "🗺️ View Dive Centre on Map", url: "#/map" }
        ]
      };
    }

    // 8. Wi-Fi, Internet & Connectivity
    if (/(wifi|wi-fi|internet|connection|password|network|online)/.test(text)) {
      return {
        reply: `📶 <strong>Wi-Fi Information:</strong><br><br>
        ${RESORT_DATA.wifi}<br><br>
        Simply select the resort guest Wi-Fi network and follow the on-screen prompt to connect. No voucher codes required.`,
        actions: [
          { text: "📞 Call Ext 650 for Tech Help", url: "tel:+9606706000" }
        ]
      };
    }

    // 9. Check-in / Check-out & Departures
    if (/(check\s*out|checkout|departure|leaving|flight|check\s*in|bill|settle|reception)/.test(text)) {
      return {
        reply: `🛎️ <strong>Check-Out & Departure Information:</strong><br><br>
        • <strong>Check-Out Time:</strong> <strong>${RESORT_DATA.checkoutTime}</strong>.<br>
        • <strong>Departure Timings:</strong> Detailed boat and seaplane transfer schedules will be delivered to your villa after 6:00 PM on the evening prior to departure.<br>
        • <strong>Baggage Collection:</strong> Contact Reception (Ext 666) when ready for luggage pick-up.<br>
        • <strong>All-Inclusive Extension:</strong> AI benefits can be enjoyed until standard checkout at noon.`,
        actions: [
          { text: "📞 Reception Desk", url: "tel:+9606706000" }
        ]
      };
    }

    // 10. Medical / Doctor / Clinic / Pharmacy
    if (/(doctor|medical|clinic|nurse|medicine|sick|hospital|injury|pharmacy|first\s*aid)/.test(text)) {
      return {
        reply: `🏥 <strong>Medical Assistance:</strong><br><br>
        A qualified resident doctor is <strong>on call 24 hours a day</strong> at Cinnamon Velifushi Maldives.<br><br>
        If you are feeling unwell or require assistance, please call <strong>Ext 666 or 650</strong> from your room phone immediately.<br>
        <em>For urgent emergencies, dial <strong>0</strong>.</em>`,
        actions: [
          { text: "🚨 Emergency Call (Reception)", url: "tel:+9606706000" }
        ]
      };
    }

    // 11. Laundry Service
    if (/(laundry|wash|iron|dry\s*clean|clothes)/.test(text)) {
      return {
        reply: `👔 <strong>Laundry Service:</strong><br><br>
        ${RESORT_DATA.laundry}<br><br>
        A laundry bag and price list are located in your villa wardrobe. Contact Housekeeping on Ext 650 for collection.`,
        actions: [
          { text: "👕 View Laundry Package", url: "#/doc/1Fmr9jTzB2e-UzsUA86C3QJQrMzPP0Bkg" }
        ]
      };
    }

    // 12. Drones, Safety & Rules
    if (/(drone|camera|safety|rule|coral|swim|smoking|smoke)/.test(text)) {
      return {
        reply: `🛡️ <strong>Resort Safety & Policies:</strong><br><br>
        • <strong>Drones:</strong> Strictly prohibited across the entire island and airspace for guest privacy and seaplane flight safety.<br>
        • <strong>Marine Life & Corals:</strong> Removing or damaging coral and shells is strictly illegal under Maldivian law. Please use reef-safe sunscreen.<br>
        • <strong>Swimming:</strong> Avoid swimming or snorkelling alone, and wear life vests in open water. Night swimming is not advised.<br>
        • <strong>Emergency:</strong> Dial <strong>0</strong> from your villa phone.`,
        actions: [
          { text: "📖 Read Resort Compendium", url: "#/compendium" }
        ]
      };
    }

    // 13. Contact & Phone Extensions
    if (/(contact|phone|call|extension|number|reception|email|reach)/.test(text)) {
      return {
        reply: `📞 <strong>Direct Resort Contacts:</strong><br><br>
        • <strong>Reception / Guest Service:</strong> Ext <strong>650</strong> or <strong>666</strong><br>
        • <strong>Emergency Service Centre:</strong> Ext <strong>0</strong><br>
        • <strong>Resort Telephone:</strong> ${RESORT_DATA.phone}<br>
        • <strong>Email:</strong> ${RESORT_DATA.email}<br>
        • <strong>Location:</strong> Vaavu Atoll, Maldives`,
        actions: [
          { text: "📞 Call Now", url: `tel:${RESORT_DATA.phone.replace(/\s/g, '')}` },
          { text: "✉️ Email Resort", url: `mailto:${RESORT_DATA.email}` }
        ]
      };
    }

    // 14. Destination & Romantic Dining
    if (/(destination\s*dining|private\s*dinner|romantic|candlelight|lobster|champagne\s*breakfast|bbq|beach\s*dinner)/.test(text)) {
      return {
        reply: `✨ <strong>Signature Destination Dining:</strong><br><br>
        Celebrate love under the stars with our curated bespoke dining experiences:<br><br>
        • 🦞 <strong>Lobster Lovers Night:</strong> Fresh lagoon lobster dinner on the beach.<br>
        • 🥂 <strong>Champagne Breakfast:</strong> Bubbly & gourmet feast on your private villa deck.<br>
        • 🕯️ <strong>Romance Under the Stars:</strong> Intimate 5-course beachfront candlelight dinner.<br>
        • 🥩 <strong>Private BBQ & Surf & Turf:</strong> Chef-crafted grill experience.<br><br>
        Reservations should be made 24 hours in advance via Reception or F&B Curator.`,
        actions: [
          { text: "⭐ Explore Experiences", url: "#/special" },
          { text: "📞 Inquire at Reception", url: "tel:+9606706000" }
        ]
      };
    }

    // 15. Item & Menu Search Fallback
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

    // 16. General Friendly Fallback
    return {
      reply: `I would love to help you with that! 😊<br><br>
      You can ask me about:<br>
      • <strong>Dining & Menus:</strong> Buffet timings, Iru Kitchen, Marlin Seafood, wine & cocktails.<br>
      • <strong>Today's Schedule:</strong> Real-time activities & evening entertainment.<br>
      • <strong>Packages:</strong> What is included in All-Inclusive.<br>
      • <strong>Mandara Spa:</strong> Massages, Elemis treatments & 15% arrival discount.<br>
      • <strong>Island Tours:</strong> Diving, dolphin trips, sandbank & fishing.<br>
      • <strong>Resort Info:</strong> Wi-Fi, 24h doctor, checkout at 12 noon, room extensions.<br><br>
      Or dial <strong>Ext 650</strong> from your villa to speak directly with our Island Team!`,
      actions: [
        { text: "🍽️ Dining Timings", query: "dining timings" },
        { text: "📅 Today's Activities", query: "today schedule" },
        { text: "🍹 All-Inclusive", query: "all inclusive" },
        { text: "📞 Call Reception", url: "tel:+9606706000" }
      ]
    };
  }

  /* =====================================================================
     2. STYLES (MATCHING CINNAMON PURPLE & GOLD BRANDING)
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
        display: none; /* Keep clean on small screens */
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
        text: `Welcome to <strong>Cinnamon Velifushi Maldives</strong>! 🌴✨<br><br>I am <strong>Veli</strong>, your island virtual concierge. Tap any quick option below or ask me about restaurants, packages, today's entertainment, spa, or resort services!`,
        time: getCurrentTime(),
        actions: [
          { text: "🍽️ Dining Timings", query: "restaurant timings" },
          { text: "📅 Today's Activities", query: "today schedule" },
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
    const closeBtn = document.getElementById('veli-close-btn');
    const clearBtn = document.getElementById('veli-clear-btn');

    // Helper: current time formatted
    function getCurrentTime() {
      const d = new Date();
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

      // Add user message
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

      // Response with natural brief delay
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
      // If user clicks internal site link (e.g. #/menus), close chat on mobile if desirable or let it navigate
      const link = e.target.closest('a[href^="#/"]');
      if (link && window.innerWidth <= 480) {
        toggleChat(false);
      }
    });

    // Global hook so any button on the page can open chat!
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

