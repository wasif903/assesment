import Joi from "joi";

const createNotes = Joi.object({
  title: Joi.string().required(),
  desc: Joi.string().max(150).required()
});

export { createNotes };
