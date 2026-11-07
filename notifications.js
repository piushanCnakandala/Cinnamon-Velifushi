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

  // Build real-time notifications data based on current day and resort content
  function getNotificationsData() {
    const today = getMaldivesDayName();
    let todayActTitle = "Weekly Activities & Sports";
    let todayActTimes = "Morning & Afternoon";
    let todayActDesc = "Join our recreation team for today's island activities.";
    let todayActPerks = ["Complimentary for resort guests", "Equipment provided by recreation team", "Meet at designated location on schedule"];

    let todayEntTitle = "Live Evening Entertainment";
    let todayEntTimes = "5:30 PM – 7:00 PM & 9:30 PM – 11:30 PM";
    let todayEntDesc = "Unwind at Fen Bar with live music, sunset views, and craft cocktails.";

    if (window.CONTENT) {
      // 1. Weekly Activities
      const actDoc = window.CONTENT["1Wq_R_jAfc4T5hKfC2_5rj5Ywj1z1jTBu"];
      if (actDoc && actDoc.blocks) {
        actDoc.blocks.forEach(b => {
          if (b.schedule && b.schedule.days) {
            const match = b.schedule.days.find(d => d[0].toLowerCase() === today.toLowerCase());
            if (match) {
              const times = b.schedule.times || ["Morning", "Afternoon"];
              const s1 = (match[1] || []).map(x => x.replace(/\|/g, ' ')).join(" & ");
              const s2 = (match[2] || []).map(x => x.replace(/\|/g, ' ')).join(" & ");
              todayActTitle = [s1, s2].filter(Boolean).join(" · ");
              todayActTimes = `${times[0]} & ${times[1]}`;
              todayActDesc = `Today's scheduled activities on the island: ${todayActTitle}. All guests are warmly invited to take part!`;
            }
          }
        });
      }

      // 2. Weekly Entertainment
      const entDoc = window.CONTENT["1e-M6ZcV7hsaUQbsou82lkROJvxzCSJJk"];
      if (entDoc && entDoc.blocks) {
        entDoc.blocks.forEach(b => {
          if (b.schedule && b.schedule.days) {
            const match = b.schedule.days.find(d => d[0].toLowerCase() === today.toLowerCase());
            if (match) {
              const times = b.schedule.times || ["Sunset", "Night"];
              const s1 = (match[1] || []).map(x => x.replace(/\|/g, ' ')).join(" & ");
              const s2 = (match[2] || []).map(x => x.replace(/\|/g, ' ')).join(" & ");
              const parts = [s1, s2].filter(Boolean);
              if (parts.length) {
                todayEntTitle = parts.join(" · ");
                todayEntTimes = `${times[0]} & ${times[1]}`;
                todayEntDesc = `Tonight at Fen Bar & Beach: ${todayEntTitle}. Enjoy island tunes and relaxing ocean breezes under the stars.`;
              }
            }
          }
        });
      }
    }

    return [
      {
        id: "act-today",
        category: "Today's Activity",
        tagColor: "#252776",
        icon: "calendar",
        title: todayActTitle,
        shortDesc: `${today}'s island activities: ${todayActTimes}`,
        image: "img/docs/weekly-activities.jpg",
        meta: `📅 ${today} · 🕒 ${todayActTimes} · 📍 Island Game Zone & Pool Deck`,
        fullDesc: todayActDesc,
        perks: [
          "Open to all in-house resort guests",
          "All sports equipment provided",
          "Fun friendly tournaments & island exploration"
        ],
        actionText: "View Weekly Activities",
        actionUrl: "#/activities",
        chatPrompt: "tell me more about today's activities"
      },
      {
        id: "ent-tonight",
        category: "Live Tonight",
        tagColor: "#7c3aed",
        icon: "star",
        title: todayEntTitle,
        shortDesc: `Live music & entertainment at Fen Bar: ${todayEntTimes}`,
        image: "img/docs/signature-cocktail.jpg",
        meta: `✨ Tonight (${today}) · 🕒 ${todayEntTimes} · 📍 Fen Bar & Pool Deck`,
        fullDesc: todayEntDesc,
        perks: [
          "Signature cocktails & premium beverages available",
          "Indoor & open-air poolside seating overlooking the sea",
          "No admission fee or advance ticket required"
        ],
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
        image: "img/docs/spa-menu.jpg",
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

    const items = getNotificationsData();

    function updateBadge() {
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
      notifWrap.classList.toggle('open', willShow);
      notifBtn.setAttribute('aria-expanded', String(willShow));
    }

    // Click / hover handlers
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

