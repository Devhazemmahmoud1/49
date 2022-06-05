const Jwt = require('jsonwebtoken');
const {PrismaClient} = require('@prisma/client');
const db = new PrismaClient();
const secretKey = "fourtyninehub495051fourtynine";


async function checkAuthToken (req, token, next) {
  try {
      if (token == null || !token) {
          req.user = null;
          console.log("this access done with No Token ! provided !")
          next()
      } else {
          authorization = token.split('Bearer ')[1]
          let checkToken = Jwt.verify(authorization, secretKey, async (err, data) => {
              if (err) throw err;
              console.log(data)
              let user = await db.users.findFirst({
                  where: {
                      id: parseInt(data.id)
                  },
                  select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                      id:  true,
                  }
              });
              if (!user) {
                  return res.status(401).send('user not found in data base');
              }
              req.user = user;
              next();
          });
          if (!checkToken) {
              return res.status(401).send('unauthorized');
          }
      }
  } catch (e) {
      return res.status(401).send('unauthorized');
  }
}

module.exports = { checkAuthToken }
