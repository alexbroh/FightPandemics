const { createFeedbackSchema } = require("./schema/feedback");

/*
 * /api/feedback
 */
async function routes(app) {
  const Feedback = app.mongo.model("Feedback");

  app.post("/", { schema: createFeedbackSchema }, async (req, reply) => {
    const { userId } = req.body;

    if (userId) {
      const [err, userFeedback] = await app.to(Feedback.find({ userId }));
      if (userFeedback[0] || err) {
        throw app.httpErrors.internalServerError();
      }
    }

    const [err] = await app.to(
      new Feedback({
        ...req.body,
        ipAddress: req.ip,
      }).save(),
    );

    if (err) {
      req.log.error("Failed submitting feedback", { err });
      throw app.httpErrors.internalServerError();
    }

    reply.code(201);
    return { success: true };
  });
}

module.exports = routes;
