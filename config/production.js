module.exports = {
    db: {
        url: process.env.MONGO_URI || "mongodb://localhost:32768/reportsystem",
        user: process.env.MONGO_USER || "",
        password: process.env.MONGO_PASS || "",
    },
    port: process.env.PORT || 8080,
    auth: {
        rootRole: process.env.ROOT_ROLE || "Manager",
        token: {
            secret: process.env.SECRET || "abracadabra",
            expiresIn: process.env.EXPIRES_IN || "1d"
        }
    }
}