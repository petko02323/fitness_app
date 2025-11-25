import passport from "../passport/passport";


export default passport.authenticate("jwt", {session: false});