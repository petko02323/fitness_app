import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { config } from "dotenv";
config()

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
};

passport.use(
    new JwtStrategy(opts, (jwtPayload, done) => {
      return done(null, jwtPayload);
    })
);

export default passport;
