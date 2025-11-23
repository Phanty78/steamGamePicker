# 🎮 Steam Game Picker

A fun and interactive web app to help you pick your next game from your Steam library! Never struggle with "what should I play?" again.

## ✨ Features

- 🎲 Random game picker from your Steam library
- 🏆 Filter by top-rated games (Metacritic scores)
- 🎨 Beautiful Steam-themed UI
- ⚡ Fast and responsive Next.js application

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- A Steam account
- A Steam API key (free!)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/steamGamePicker.git
   cd steamGamePicker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up your environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```
   
   Add your Steam API key to the `.env` file:
   ```env
   STEAM_API_KEY=your_steam_api_key_here
   ```
   
   **How to get your Steam API key:**
   - Visit [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
   - Log in with your Steam account
   - Register for a key (you can use any domain name, e.g., `localhost`)
   - Copy your key and paste it in the `.env` file

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action! 🎉

## 🤝 Contributing

We love contributions! This is a fun, pressure-free project and we welcome developers of all skill levels. Whether you're fixing a typo, adding a feature, or improving documentation, your contribution matters! 💙

### How to Contribute

1. **Fork the repository**
   
   Click the "Fork" button at the top right of this page.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/steamGamePicker.git
   cd steamGamePicker
   ```

3. **Create a new branch**
   ```bash
   git checkout -b feature/your-awesome-feature
   # or
   git checkout -b fix/bug-you-fixed
   ```

4. **Make your changes**
   
   - Write clean, readable code
   - Test your changes locally
   - Make sure the app still runs without errors

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: your descriptive commit message"
   ```
   
   Commit message tips:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for improvements to existing features
   - `Docs:` for documentation changes
   - `Ref:` for code refactoring
   - `Del:` for deletion of files or features
   

6. **Push to your fork**
   ```bash
   git push origin feature/your-awesome-feature
   ```

7. **Open a Pull Request**
   
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Write a clear description of your changes
   - Submit the PR!

### Pull Request Guidelines

- **Be descriptive**: Explain what your PR does and why
- **Keep it focused**: One feature or fix per PR
- **Test your code**: Make sure everything works before submitting
- **Be patient**: We'll review your PR as soon as possible
- **Be open to feedback**: We might suggest some changes, and that's okay!

### Ideas for Contributions

Not sure where to start? Here are some ideas:

- 🐛 Fix bugs or issues
- ✨ Add new filtering options (by genre, playtime, etc.)
- 🎨 Improve the UI/UX
- 📝 Improve documentation
- ♿ Add accessibility features
- 🌍 Add internationalization (i18n)
- ⚡ Performance optimizations
- 🧪 Add tests

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Steam Web API

## 📝 License

This project is open source and available under the [Apache License 2.0](LICENSE).

## 💬 Community

This is a fun, inclusive, and pressure-free project! We believe in:

- 🌈 **Inclusivity**: Everyone is welcome, regardless of experience level
- 🤗 **Kindness**: Be respectful and supportive
- 🎉 **Fun**: This is a hobby project, let's enjoy it!
- 📚 **Learning**: Questions are encouraged, mistakes are learning opportunities

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Steam Web API](https://steamcommunity.com/dev)
- Inspired by the struggle of having too many games to choose from 😅

---

**Happy gaming and happy coding!** 🎮✨
