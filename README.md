# ✅ TaskFlow — Kanban Board

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![localStorage](https://img.shields.io/badge/localStorage-Data_Persistence-4CAF50?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)

A fully featured drag-and-drop Kanban board built with zero dependencies — no frameworks, no libraries, no build tools. Just HTML, CSS, and JavaScript. Tasks persist across sessions using `localStorage`.

**🔗 Live Demo:** [programedbyhassan.github.io/Kanban-Board](https://programedbyhassan.github.io/Kanban-Board)

---

## ✨ Features

- 🖱️ **Drag & Drop** — Drag cards between columns with smooth visual feedback
- ➕ **Add / Edit / Delete Cards** — Full CRUD on every task card
- 🏷️ **Labels** — Tag cards as Feature, Bug, Design, Urgent, or Done
- 📅 **Due Dates** — Set deadlines; overdue cards are highlighted in red
- 📋 **Custom Columns** — Add, rename, or delete columns to match your workflow
- 💾 **Persistent Storage** — All data saved to `localStorage`, survives page refresh
- 🌙 **Dark / Light Mode** — Toggle with one click
- 📊 **Task Counter** — Live stats bar shows card counts per column
- 📱 **Responsive** — Horizontally scrollable on mobile

---

## 🖼️ Screenshots

> _Add screenshots after deploying. Use [screenshotone.com](https://screenshotone.com) or take them manually._

| Board View (Light) | Board View (Dark) | Card Edit Modal |
|---|---|---|
| ![Light](screenshots/light.png) | ![Dark](screenshots/dark.png) | ![Modal](screenshots/modal.png) |

---

## 🚀 Getting Started

No installation needed.

### Option 1 — Open directly

```bash
git clone https://github.com/programedbyhassan/Kanban-Board.git
open index.html
```

### Option 2 — Deploy to GitHub Pages

1. Upload `index.html` to a new GitHub repo
2. Go to **Settings → Pages → Source → main / root**
3. Your board is live at `https://programedbyhassan.github.io/Kanban-Board`

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure and drag-and-drop API |
| CSS3 | Custom properties, transitions, dark mode, responsive layout |
| Vanilla JavaScript | State management, DOM rendering, event handling |
| localStorage | Client-side data persistence across sessions |

---

## 📁 Project Structure

```
kanban-board/
│
├── index.html    # Entire app — HTML, CSS, and JS in one file
└── README.md     # You are here
```

---

## 🧠 How It Works

The app maintains a single `state` object that holds all columns and cards:

```js
{
  columns: [
    {
      id: 'col-1',
      title: 'To Do',
      color: '#5b6af0',
      cards: [
        { id: 'c1', text: 'Build the homepage', labels: ['feat'], due: '2024-12-01' }
      ]
    }
  ]
}
```

Every user action (add, edit, delete, drag) updates this object and writes it to `localStorage`. On page load, state is read back from storage — making the board fully persistent without any backend.

---

## 💡 What I Learned

- Implementing the HTML5 Drag and Drop API from scratch
- Managing complex UI state in vanilla JavaScript without a framework
- Writing a render loop that rebuilds the DOM from a single source of truth
- Persisting structured data with `localStorage`
- Building a dark/light theme system using CSS custom properties
- Handling edge cases in drag-and-drop (drop position, placeholder elements)

---

## 🔮 Future Improvements

- [ ] Search and filter cards by label or keyword
- [ ] Drag to reorder columns
- [ ] Card priority levels (low / medium / high)
- [ ] Export board as JSON backup file
- [ ] Import board from JSON
- [ ] Keyboard shortcuts for power users

---

## 📄 License

Open source under the [MIT License](LICENSE).

---

> Built with ❤️ as part of my web development portfolio.
> Inspired by tools like Trello and Linear.
