"use strict";

/** GET / DELETE /api/ai/history */
function createChatController({ history, logger = console }) {
  async function getHistory(req, res) {
    try {
      const requested = Number.parseInt(req.query.limit, 10);
      const limit = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), 100) : 50;

      const conversation = await history.getConversation(req.user.id);
      const messages = ((conversation && conversation.messages) || []).slice(-limit).map((m) => ({
        id: String(m._id),
        role: m.role,
        content: m.content,
        intent: m.intent || null,
        verified: Boolean(m.verified),
        createdAt: m.createdAt,
      }));

      return res.status(200).json({
        messages,
        language: (conversation && conversation.context && conversation.context.language) || null,
      });
    } catch (error) {
      logger.error("Chat history error:", error);
      return res.status(500).json({ message: "Could not load your conversation." });
    }
  }

  async function clearHistory(req, res) {
    try {
      const deleted = await history.clearConversation(req.user.id);
      return res.status(200).json({
        message: deleted ? "Conversation cleared." : "There was no conversation to clear.",
      });
    } catch (error) {
      logger.error("Clear chat history error:", error);
      return res.status(500).json({ message: "Could not clear your conversation." });
    }
  }

  return { getHistory, clearHistory };
}

module.exports = { createChatController };
