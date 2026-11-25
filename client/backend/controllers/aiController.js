"use strict";

/** POST /api/ai/chat */
function createAiController({ assistant, history, logger = console }) {
  async function chat(req, res) {
    try {
      const userId = req.user.id;
      const { message, language, pageContext } = req.chat;

      const conversation = await history.getConversation(userId);
      const context = (conversation && conversation.context) || {};
      const recent = ((conversation && conversation.messages) || [])
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await assistant.respond({
        user: req.user,
        text: message,
        language,
        context,
        history: recent,
        pageContext,
      });

      const askedAt = new Date();
      const answeredAt = new Date(askedAt.getTime() + 1);

      let persisted = true;
      try {
        await history.appendTurn(
          userId,
          [
            { role: "user", content: message, createdAt: askedAt },
            { role: "assistant", content: result.reply, intent: result.intent, verified: result.verified, createdAt: answeredAt },
          ],
          result.contextPatch
        );
      } catch (error) {
        persisted = false;
        logger.error("Could not save chat history:", error.message);
      }

      return res.status(200).json({
        message: { role: "assistant", content: result.reply, createdAt: answeredAt },
        intent: result.intent,
        language: result.language,
        verified: result.verified,
        sources: result.sources,
        suggestions: result.suggestions,
        actions: result.actions,
        emergency: result.emergency,
        usedAI: result.usedAI,
        persisted,
      });
    } catch (error) {
      logger.error("Civic assistant error:", error);
      return res.status(500).json({ message: "The assistant is unavailable right now. Please try again." });
    }
  }

  return { chat };
}

module.exports = { createAiController };
