# AI Chat Application

A modern, responsive chat application that integrates with n8n workflows to provide AI-powered conversations with PDF generation capabilities.

## ✨ Features

- 🤖 **AI-Powered Chat**: Integrates with n8n workflows for intelligent responses
- 📄 **PDF Generation**: Automatically generates and displays PDF links
- 🎨 **Modern UI**: Beautiful glass morphism design with video background
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🔒 **Rate Limiting**: Built-in protection against spam and abuse
- 💾 **Session Management**: Persistent chat history with localStorage
- ⚡ **Real-time**: Instant message delivery and response

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- n8n instance running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-chat.git
   cd ai-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   N8N_WEBHOOK_URL=http://your-n8n-server.com/webhook/chat
   ```

4. **Add your background video**
   - Place your `background-video.mp4` file in the `public/` folder

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `N8N_WEBHOOK_URL` | Your n8n webhook endpoint | `http://localhost:5678/webhook/chat` |

### Rate Limiting

The application includes built-in rate limiting:
- **10 requests per minute** per IP address
- Configurable in `src/app/api/proxy-chat/route.ts`

## 📁 Project Structure

```
ai-chat/
├── public/
│   └── background-video.mp4    # Background video file
├── src/
│   └── app/
│       ├── api/
│       │   └── proxy-chat/
│       │       └── route.ts    # API proxy to n8n
│       ├── page.tsx            # Main chat interface
│       └── globals.css         # Global styles
├── .env.local                  # Environment variables
└── package.json
```

## 🔧 API Integration

The application expects your n8n workflow to return responses in this format:

```json
[
  {
    "output": "Your AI response message here",
    "pdfUrl": "https://example.com/generated-document.pdf"
  }
]
```

### Supported Response Fields:
- `output` - The main response text
- `pdfUrl` - Optional PDF document link
- `message` - Alternative to `output`
- `text` - Alternative to `output`
- `content` - Alternative to `output`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push

### Other Platforms

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🔒 Security Features

- ✅ Input validation and sanitization
- ✅ Rate limiting (10 requests/minute per IP)
- ✅ Error handling and graceful degradation
- ✅ Environment variable configuration
- ✅ No sensitive data in client-side code

## 🎨 Customization

### Styling
- Modify styles in `src/app/page.tsx`
- Update colors, gradients, and animations
- Customize the glass morphism effects

### Video Background
- Replace `public/background-video.mp4` with your own video
- Adjust opacity in the video element styles
- Add fallback background gradients

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**Video not playing:**
- Ensure the video file is in the `public/` folder
- Check browser autoplay settings
- Verify video format is MP4

**Webhook not responding:**
- Verify your n8n workflow is active
- Check the webhook URL in environment variables
- Ensure n8n server is running

**Rate limit errors:**
- Wait 1 minute before sending more messages
- Check if you're behind a shared IP/proxy

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the production deployment guide

---

Built with ❤️ using Next.js, React, and n8n
