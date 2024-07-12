
  module.exports = {
    sqlConfig: {
        user: 'softlogger',
        password: 'PASSWORD',  // Replace with your actual password
        server: 'je5jojrsbv.database.windows.net',
        database: 'PavanBank',
        port: 1433,
        trustedConnection: true,
        options: {
            encrypt: true, // Use this if you're on Windows Azure
            enableArithAbort: true,
            trustServerCertificate: true
        }
    },
    mongoUri: "mongodb+srv://pilsner:PASSWORD@cluster0.a0nybom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"  // Replace with your actual MongoDB URI
};

