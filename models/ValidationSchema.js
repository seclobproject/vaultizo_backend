import Joi from 'joi';

export const validateRegister = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email(),
        phone: Joi.string(),
        country: Joi.string().required(),
        password: Joi.string().min(6).required()
    }).or('email', 'phone');  // At least one of email or phone must be provided

    return schema.validate(data);
};