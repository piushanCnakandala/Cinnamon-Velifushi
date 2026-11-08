/**
 * Cinnamon Velifushi Maldives — Top Notification Bell, Dropdown & Detail Modal
 * Shows real-time today's activities, entertainment, and resort offers.
 */

(function () {
  'use strict';

  // Helper: current day of week in Maldives time
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

  // Master weekly schedule fallback & lookup
  const RESORT_WEEKLY_SCHEDULE = {
    Sunday: {
      activities: [
        { time: "11:00 am – 11:45 am", name: "Zumba Dance", location: "Pool Deck" },
        { time: "4:30 pm – 5:30 pm", name: "Beach Volleyball Tournament", location: "Game Zone" }
      ],
      entertainment: [
        { time: "5:30 pm – 7:00 pm", name: "Sunset DJ Tunes", location: "Fen Bar" },
        { time: "9:30 pm – 11:30 pm", name: "DJ Tunes", location: "Hama Bar" }
      ]
    },
    Monday: {
      activities: [
        { time: "11:00 am – 11:45 am", name: "Art of Massage", location: "Mandara Spa" },
        { time: "4:30 pm – 5:30 pm", name: "Trial Diving", location: "Lagoon (pickup at Dive Center)" }
      ],
      entertainment: [
        { time: "5:30 pm – 7:00 pm", name: "Live Saxophone Music", location: "Fen Bar" },
        { time: "9:30 pm – 11:30 pm", name: "Karaoke Night", location: "Fen Bar" }
      ]
    },
    Tuesday: {
      activities: [
        { time: "11:00 am – 11:45 am", name: "Traditional Maldivian Handicraft Lessons", location: "Iru Kitchen & Bar" },
        { time: "4:30 pm – 5:30 pm", name: "Pool Party", location: "Pool Deck" }
      ],
      entertainment: [
        { time: "5:30 pm – 7:00 pm", name: "Pool Party Music", location: "Pool Deck" },
        { time: "9:30 pm – 11:30 pm", name: "Balinese Dance", location: "Fen Bar" }
      ]
    },
    Wednesday: {
      activities: [
        { time: "11:00 am – 11:45 am", name: "Live Cooking with Chef", location: "Iru Kitchen & Bar (All-Inclusive)" },
        { time: "4:30 pm – 5:30 pm", name: "Beach Volleyball & Sundown Yoga", location: "Game Zone & Fen Pool Bar Deck" }
      ],
      entertainment: [
        { time: "9:30 pm – 11:30 pm", name: "Beach Cinema", location: "Fen Beach" }
      ]
    },
    Thursday: {
      activities: [
        { time: "11:00 am – 11:45 am", name: "Retail Bazaar", location: "Mandara Spa at Fen Bar" },
        { time: "4:30 pm – 5:30 pm", name: "Trial Diving", location: "Lagoon (pickup at Dive Center)" }
      ],
      entertainment: [
        { time: "5:30 pm – 7:00 pm", name: "Sunset DJ Tunes", location: "Fen Beach / Fen Bar" },
        { time: "9:30 pm – 11:30 pm", name: "DJ Tunes", location: "Fen Beach / Fen Bar" }
      ]
    },
    Friday: {
      activities: [
        { time: "11:00 am – 11:45 am", name: "Make Your Own Cocktails", location: "Iru Kitchen & Bar" },
        { time: "4:30 pm – 5:30 pm", name: "Beach Cleaning Hour & Sundown Yoga", location: "Reception & Fen Pool Bar Deck" }
      ],
      entertainment: [
        { time: "5:30 pm – 7:00 pm", name: "Sunset Sax & Sea Breeze", location: "Fen Beach" },
        { time: "9:30 pm – 11:30 pm", name: "Karaoke Night", location: "Fen Bar" }
      ]
    },
    Saturday: {
      activities: [
        { time: "11:00 am – 11:45 am", name: "Explore our Resort Tour", location: "pickup at Reception" },
        { time: "4:30 pm – 5:30 pm", name: "Dart Championship", location: "Fen Pool Bar Deck" }
      ],
      entertainment: [
        { time: "5:30 pm – 7:00 pm", name: "Live Band Sunset Session", location: "Fen Bar" },
        { time: "9:30 pm – 11:30 pm", name: "Live Band Performance", location: "Fen Bar" }
      ]
    }
  };

  // Build real-time notifications data based on current day and resort content
  function getNotificationsData() {
    const today = getMaldivesDayName();
    const contentStore = (typeof CONTENT !== 'undefined' ? CONTENT : (window.CONTENT || null));

    // Base schedule from master table
    let daySched = RESORT_WEEKLY_SCHEDULE[today] || RESORT_WEEKLY_SCHEDULE['Sunday'];

    // If CONTENT is present, dynamically sync from weekly documents
    if (contentStore) {
      // 1. Activities sync
      const actDoc = contentStore["1Wq_R_jAfc4T5hKfC2_5rj5Ywj1z1jTBu"];
      if (actDoc && actDoc.blocks) {
        actDoc.blocks.forEach(b => {
          if (b.schedule && b.schedule.days) {
            const match = b.schedule.days.find(d => d[0].toLowerCase() === today.toLowerCase());
            if (match) {
              const times = b.schedule.times || ["11:00 am", "4:30 pm"];
              const actList = [];
              if (match[1] && match[1].length) {
                match[1].forEach(x => {
                  const [n, l] = x.split('|');
                  actList.push({ time: times[0] || "11:00 am", name: n.trim(), location: (l || '').trim() });
                });
              }
              if (match[2] && match[2].length) {
                match[2].forEach(x => {
                  const [n, l] = x.split('|');
                  actList.push({ time: times[1] || "4:30 pm", name: n.trim(), location: (l || '').trim() });
                });
              }
              if (actList.length > 0) {
                daySched = { ...daySched, activities: actList };
              }
            }
          }
        });
      }

      // 2. Entertainment sync
      const entDoc = contentStore["1e-M6ZcV7hsaUQbsou82lkROJvxzCSJJk"];
      if (entDoc && entDoc.blocks) {
        entDoc.blocks.forEach(b => {
          if (b.schedule && b.schedule.days) {
            const match = b.schedule.days.find(d => d[0].toLowerCase() === today.toLowerCase());
            if (match) {
              const times = b.schedule.times || ["5:30 pm", "9:30 pm"];
              const entList = [];
              if (match[1] && match[1].length) {
                match[1].forEach(x => {
                  const [n, l] = x.split('|');
                  entList.push({ time: times[0] || "5:30 pm", name: n.trim(), location: (l || '').trim() });
                });
              }
              if (match[2] && match[2].length) {
                match[2].forEach(x => {
                  const [n, l] = x.split('|');
                  entList.push({ time: times[1] || "9:30 pm", name: n.trim(), location: (l || '').trim() });
                });
              }
              if (entList.length > 0) {
                daySched = { ...daySched, entertainment: entList };
              }
            }
          }
        });
      }
    }

    // Format Daytime Activities
    const actNames = daySched.activities.map(a => a.name).join(' & ');
    const actLocations = [...new Set(daySched.activities.map(a => a.location.replace(/^at\s+/i, '')))].join(' & ');
    const actShortDesc = daySched.activities.map(a => `${a.time.split('–')[0].trim()}: ${a.name} (${a.location.replace(/^at\s+/i, '')})`).join(' · ');
    const actPerks = [
      ...daySched.activities.map(a => `🕒 ${a.time}: ${a.name} (${a.location})`),
      "Complimentary for all in-house resort guests",
      "All sports equipment provided by our recreation team",
      "Open to all skill levels — meet directly at the location"
    ];

    // Format Evening Entertainment
    const entNames = daySched.entertainment.length > 0
      ? daySched.entertainment.map(e => `${e.name} (${e.location.replace(/^at\s+/i, '')})`).join(' & ')
      : "Relaxing Ocean Lounge Music";
    const entShortDesc = daySched.entertainment.length > 0
      ? daySched.entertainment.map(e => `${e.time.split('–')[0].trim()}: ${e.name} (${e.location.replace(/^at\s+/i, '')})`).join(' · ')
      : "Chill lounge music at Fen Bar tonight";
    const entPerks = [
      ...daySched.entertainment.map(e => `🕒 ${e.time}: ${e.name} (${e.location})`),
      "Signature cocktails & premium beverages available",
      "Open-air poolside seating overlooking the sea",
      "No cover charge or advance reservation needed"
    ];

    return [
      {
        id: "act-today",
        category: "Today's Activities",
        tagColor: "#252776",
        icon: "calendar",
        title: `${today} Activities: ${actNames}`,
        shortDesc: actShortDesc,
        image: "img/YOGA.jpg.jpeg",
        meta: `📅 ${today} · 📍 ${actLocations}`,
        fullDesc: `Join our recreation team today for exciting island sports and fitness! Take part in ${actNames} scheduled throughout the day. All in-house resort guests are warmly welcomed!`,
        perks: actPerks,
        actionText: "View Full Schedule",
        actionUrl: "#/activities",
        chatPrompt: `tell me about today's ${today} activities: ${actNames}`
      },
      {
        id: "ent-tonight",
        category: "Live Tonight",
        tagColor: "#7c3aed",
        icon: "star",
        title: `Live Tonight: ${entNames}`,
        shortDesc: entShortDesc,
        image: "img/docs/signature-cocktail.jpg",
        meta: `✨ Tonight (${today}) · 📍 Fen Bar & Pool Deck`,
        fullDesc: `Unwind tonight at Cinnamon Velifushi Maldives with live evening entertainment: ${entNames}. Sip tropical cocktails and enjoy relaxing ocean breezes under the stars.`,
        perks: entPerks,
        actionText: "Check Entertainment",
        actionUrl: "#/activities",
        chatPrompt: "what is the entertainment tonight?"
      },
      {
        id: "spa-offer",
        category: "Special Offer",
        tagColor: "#b45309",
        icon: "spa",
        title: "15% Off Spa Treatments + Free 5-Min Welcome Massage",
        shortDesc: "Enjoy 15% discount at Mandara Spa plus a complimentary welcome massage voucher.",
        image: "img/WhatsApp Image 2026-11-07 at 01.10.31.jpeg",
        meta: "🌺 Mandara Spa · 🕒 10:00 AM – 8:00 PM · 📍 Overwater Spa Pavilion",
        fullDesc: "Take time to relax, recharge and restore during your stay. Visit Mandara Spa for a complimentary 5-minute massage and a refreshing ginger tea, plus enjoy an exclusive 15% discount on all published treatment rates throughout your stay.",
        perks: [
          "15% off full menu spa & wellness treatments",
          "Complimentary 5-minute welcome massage voucher + jasmine/ginger tea",
          "Featuring authentic Balinese therapists & luxury ELEMIS skincare",
          "Valid for the entire duration of your stay"
        ],
        actionText: "Explore Spa Menu",
        actionUrl: "#/spa",
        chatPrompt: "tell me about the 15% spa discount"
      },
      {
        id: "excursion-free",
        category: "Included in All-Inclusive",
        tagColor: "#059669",
        icon: "palm",
        title: "Complimentary Dolphin Watching or Sunset Fishing",
        shortDesc: "All-Inclusive guests receive one free signature ocean excursion.",
        image: "img/docs/dolphin-watching.jpg",
        meta: "🐬 Vaavu Atoll Waters · 🕒 Morning or Sunset · 📍 Excursion Jetty",
        fullDesc: "As an All-Inclusive guest at Cinnamon Velifushi Maldives, you are entitled to your choice of either a Dolphin Watching safari or a traditional Maldivian Sunset Fishing trip at no extra charge.",
        perks: [
          "Choice of Dolphin Watching or Sunset Fishing cruise",
          "Traditional Maldivian Dhoni boat with experienced crew",
          "All fishing handlines, bait & safety equipment included",
          "Prior reservation recommended 24 hours in advance at Reception"
        ],
        actionText: "View Excursions",
        actionUrl: "#/island",
        chatPrompt: "how to book the free all-inclusive excursion?"
      },
      {
        id: "dining-special",
        category: "Chef's Special",
        tagColor: "#be185d",
        icon: "menu",
        title: "Lobster Lovers Night & Beachfront BBQ",
        shortDesc: "Bespoke private dining under the stars on the edge of the lagoon.",
        image: "img/Signature Experiences.jpg",
        meta: "🦞 Beachfront Dining · 🕒 7:00 PM – 10:00 PM · 📍 Shoreline",
        fullDesc: "Elevate your evening with our signature destination dining experiences. From fresh local lagoon lobster paired with fine wines to private candlelight barbecues right by the gentle ocean waves, our culinary team will curate an unforgettable culinary memory.",
        perks: [
          "Intimate seaside table setup with ambient candlelight & torches",
          "Multi-course chef-crafted menu featuring prime seafood and meats",
          "Dedicated server for your private table",
          "Vegetarian options and custom pairings available on request"
        ],
        actionText: "View Destination Dining",
        actionUrl: "#/special",
        chatPrompt: "tell me about lobster lovers dinner and beach bbq"
      }
    ];
  }

  // Icons SVG helper
  const ICONS_SVG = {
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>',
    spa: '<path d="M12 21c-5 0-8-3-8-7 3 0 6 1 8 4 2-3 5-4 8-4 0 4-3 7-8 7Z"/><path d="M12 18c-2-3-2-7 0-11 2 4 2 8 0 11Z"/>',
    palm: '<path d="M12 22V11"/><path d="M12 11C10 7 6 6 3 7c3 0 6 1 9 4Z"/><path d="M12 11c2-4 6-5 9-4-3 0-6 1-9 4Z"/><path d="M12 11c-1-4-4-7-7-8 3 2 5 5 7 8Z"/><path d="M7 22h10"/>',
    menu: '<path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M5 3v6M9 3v6"/><path d="M17 21V3c-2 1.5-3 4-3 7v4h3"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>'
  };
  const getIcon = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS_SVG[k] || ''}</svg>`;

  function injectNotifications() {
    const notifBtn = document.getElementById('notifBtn');
    const notifWrap = document.getElementById('notifWrap');
    const notifMenu = document.getElementById('notifMenu');
    const notifDot = document.getElementById('notifDot');
    const notifModalOverlay = document.getElementById('notifModalOverlay');
    const notifModalCard = document.getElementById('notifModalCard');

    if (!notifBtn || !notifMenu) return;

    // Track read state in sessionStorage
    let readIds = [];
    try {
      readIds = JSON.parse(sessionStorage.getItem('veli_notifs_read') || '[]');
    } catch (e) { }

    let items = getNotificationsData();

    function updateBadge() {
      items = getNotificationsData();
      const unreadCount = items.filter(it => !readIds.includes(it.id)).length;
      if (unreadCount > 0) {
        notifDot.style.display = 'block';
        notifDot.classList.add('pulse');
      } else {
        notifDot.style.display = 'none';
        notifDot.classList.remove('pulse');
      }
    }

    // Render dropdown menu items
    function renderDropdown() {
      items = getNotificationsData();
      const today = getMaldivesDayName();
      notifMenu.innerHTML = `
        <div class="notif-head">
          <div>
            <h4>Highlights & Offers</h4>
            <span>${today} in Velifushi</span>
          </div>
          <button type="button" class="notif-mark-read" id="notifMarkRead" title="Mark all read">Clear</button>
        </div>
        <div class="notif-list">
          ${items.map(it => {
        const isUnread = !readIds.includes(it.id);
        return `
              <div class="notif-item ${isUnread ? 'unread' : ''}" data-id="${it.id}">
                <div class="notif-item-ic">${getIcon(it.icon)}</div>
                <div class="notif-item-tx">
                  <span class="notif-item-tag" style="background:${it.tagColor}15;color:${it.tagColor}">${it.category}</span>
                  <b>${it.title}</b>
                  <p>${it.shortDesc}</p>
                </div>
                ${isUnread ? '<span class="notif-item-dot"></span>' : ''}
              </div>
            `;
      }).join('')}
        </div>
        <div class="notif-foot">Tap any highlight for full details</div>
      `;

      document.getElementById('notifMarkRead')?.addEventListener('click', e => {
        e.stopPropagation();
        items = getNotificationsData();
        readIds = items.map(it => it.id);
        try { sessionStorage.setItem('veli_notifs_read', JSON.stringify(readIds)); } catch (err) { }
        renderDropdown();
        updateBadge();
      });
    }

    // Open detail modal for specific notification
    function openDetailModal(item) {
      if (!notifModalOverlay || !notifModalCard) return;

      // Mark as read
      if (!readIds.includes(item.id)) {
        readIds.push(item.id);
        try { sessionStorage.setItem('veli_notifs_read', JSON.stringify(readIds)); } catch (err) { }
        renderDropdown();
        updateBadge();
      }

      notifModalCard.innerHTML = `
        <div class="notif-modal-hero" style="background-image:url('${item.image}')">
          <button type="button" class="notif-modal-close" id="notifModalClose" aria-label="Close dialog">
            ${getIcon('close')}
          </button>
        </div>
        <div class="notif-modal-body">
          <div class="notif-modal-badge" style="color:${item.tagColor}">
            ${getIcon(item.icon)} ${item.category}
          </div>
          <h3 class="notif-modal-title">${item.title}</h3>
          <div class="notif-modal-meta">${item.meta}</div>
          <p class="notif-modal-desc">${item.fullDesc}</p>
          <ul class="notif-modal-perks">
            ${item.perks.map(p => `<li>${getIcon('check')}<span>${p}</span></li>`).join('')}
          </ul>
          <div class="notif-modal-actions">
            <a href="${item.actionUrl}" class="notif-modal-btn primary" id="notifModalAction">${item.actionText}</a>
            <button type="button" class="notif-modal-btn secondary" id="notifModalChat">Ask Island Concierge</button>
          </div>
        </div>
      `;

      notifModalOverlay.classList.add('open');
      notifModalOverlay.setAttribute('aria-hidden', 'false');

      // Close button
      document.getElementById('notifModalClose').addEventListener('click', closeDetailModal);

      // Primary Action (routes to page and closes modal)
      document.getElementById('notifModalAction').addEventListener('click', () => {
        closeDetailModal();
      });

      // Ask Concierge button
      document.getElementById('notifModalChat').addEventListener('click', () => {
        closeDetailModal();
        if (window.openIslandConcierge) {
          window.openIslandConcierge(item.chatPrompt);
        }
      });
    }

    function closeDetailModal() {
      if (!notifModalOverlay) return;
      notifModalOverlay.classList.remove('open');
      notifModalOverlay.setAttribute('aria-hidden', 'true');
    }

    // Toggle dropdown
    function toggleDropdown(show) {
      const willShow = show !== undefined ? show : !notifWrap.classList.contains('open');
      if (willShow) {
        renderDropdown();
      }
      notifWrap.classList.toggle('open', willShow);
      notifBtn.setAttribute('aria-expanded', String(willShow));
    }

    // Click handlers
    notifBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
      if (!notifWrap.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    // Delegate clicks on dropdown items
    notifMenu.addEventListener('click', e => {
      const row = e.target.closest('.notif-item');
      if (row && row.dataset.id) {
        items = getNotificationsData();
        const item = items.find(it => it.id === row.dataset.id);
        if (item) {
          toggleDropdown(false);
          openDetailModal(item);
        }
      }
    });

    // Close modal on overlay background click
    notifModalOverlay.addEventListener('click', e => {
      if (e.target === notifModalOverlay) {
        closeDetailModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        toggleDropdown(false);
        closeDetailModal();
      }
    });

    // Initialize
    renderDropdown();
    updateBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNotifications);
  } else {
    injectNotifications();
  }
})();


