const db = require("../models");
const { Package, Currency } = db;

const listPackages = async () => {
    try {
        const packages = await Package.findAll({
            include: [
                {
                    model: Currency,
                    as: "currency",
                },
            ],
            order: [["id", "ASC"]]
        });

        if (packages.length === 0) {
            console.log("No packages found.");
            return;
        }


        console.log("Available Packages:");
        console.log("--------------------");

        packages.forEach(pkg => {
            console.log(`ID: ${pkg.id}`);
            console.log(`Name: ${pkg.package_name}`);
            console.log(`Price: ${pkg.price}`);
            console.log(`Yearly Price: ${pkg.yearly_price}`);
            console.log(`Currency: ${pkg.currency ? pkg.currency.symbol : "N/A"}`);
            console.log(`Duration: ${pkg.duration}`);
            console.log(`Status: ${pkg.status}`);
            console.log(`Features: ${pkg.features.join(", ")}`);
            console.log("--------------------");
        });

        process.exit(0);


    } catch (error) {
        console.error("Error fetching packages:", error);
        process.exit(1);
    }
};