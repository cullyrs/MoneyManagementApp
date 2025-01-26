import bcrypt from 'bcrypt';

const saltRounds = 10;
export const hashed =  (entry) =>{
    const salt = bcrypt.genSaltSync(saltRounds)
    bcrypt.hashSync(entry,salt);
    return bcrypt.hashSync(entry,salt);
};

export const compareEntry = (entry, hashed) =>{
    return bcrypt.compareSync(entry,hashed);
};
