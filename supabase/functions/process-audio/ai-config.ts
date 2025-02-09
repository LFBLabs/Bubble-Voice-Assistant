
export const greetingPatterns = [
  /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|what'?s up|yo|hiya|greetings)/i,
  /^(thanks|thank you|thanks a lot|thank you so much|appreciated|great help)/i
];

export const commonQuestionPatterns = [
  {
    pattern: /^what (is|are|does) bubble/i,
    response: "Bubble is a powerful no-code platform that lets you build web applications without writing code. It provides a visual interface where you can design, develop, and deploy web applications quickly and efficiently."
  },
  {
    pattern: /^how (do|can) (i|you) (get started|begin|start)/i,
    response: "To get started with Bubble, first visit bubble.io and create an account. Then, you can begin by watching their tutorial videos, exploring the visual programming interface, and trying out their sample applications. Would you like to know more about any specific aspect?"
  },
  {
    pattern: /^(is bubble free|how much (does|is) bubble cost)/i,
    response: "Bubble offers both free and paid plans. You can start with their free plan to learn and build basic applications. Paid plans start when you need more resources, custom domains, or additional features. The specific pricing depends on your needs and usage."
  },
  {
    pattern: /^can bubble (handle|manage|do) (user authentication|auth|login)/i,
    response: "Yes, Bubble has built-in user authentication features! You can easily set up user registration, login, password reset, and social login without any coding. It's all handled securely through Bubble's platform."
  },
  {
    pattern: /^(what|which) database (does|do) bubble use/i,
    response: "Bubble uses its own hosted database system. It's a scalable, cloud-based database that automatically handles your data structure and relationships. You can create and modify your database schema visually, and it supports complex queries and data operations."
  },
  {
    pattern: /^how (do|can) (i|you) deploy (a|my) bubble app/i,
    response: "Deploying a Bubble app is straightforward! Once you're ready, just click the 'Deploy' button in your Bubble editor. Your app will be live on a Bubble subdomain, or you can connect your custom domain if you're on a paid plan."
  }
];

export const greetingResponses = [
  "Hey! I'm excited to chat about Bubble with you. What's on your mind?",
  "Hi there! I'd love to help you out with Bubble today. What can I explain?",
  "Hey! Always happy to talk about Bubble. What would you like to know?",
];

export const thankYouResponses = [
  "You're welcome! I'm really glad I could help. Feel free to ask me anything else about Bubble!",
  "It's my pleasure! I enjoy helping people learn about Bubble. What else would you like to know?",
  "Anytime! I'm here to help you succeed with Bubble. Would you like to learn more?",
  "I'm happy I could assist! Don't hesitate to ask if you have more questions about Bubble.",
  "That's so kind of you! I'm here anytime you need help with Bubble.",
];

export const fallbackResponse = "I'd be happy to help you with that! What specific aspect of Bubble would you like to know more about?";
