import bcrypt from 'bcrypt';

const saltRounds = 10;
 const hashed =  async (entry) =>{
    const salt = bcrypt.genSaltSync(saltRounds)
    return bcrypt.hash(entry,salt);
};

const compareEntry = async (entry, hashed) =>{
    return bcrypt.compare(entry,hashed);
};

export {hashed as default, compareEntry};
