
import cart from "../Models/addToCart.model.js";
import medicine from "../Models/medicine.model.js";
import user from "../Models/user.model.js";

const addMedicines = async (req, res) => {
    const { medicineName, companyName, category, form, price, description, prescription } = req.body;

    if ([medicineName, companyName, category, form, price].some(
        (field) => {
            if (!field || field.trim() === "") return console.log(field);


        }
    )) {
        return res.status(401).json({
            success: false,
            message: "Mandatory fields can't be empty",
            field
        })
    }
    const newMedicine = await medicine.create({
        medicineName,
        companyName,
        category,
        form,
        price,
        prescription,
        description
    })

    return res.status(201).json({
        success: true,
        message: "medicine added successfully",
        newMedicine
    })
}

const showMedicines = async (req, res) => {
    try {

        const medicines = await medicine.find()

        if (!medicines) {
            return res.status(401).json({
                success: false,
                message: "No Medicines found in DataBase"
            })
        }

        return res.status(201).json({
            success: true,
            message: "medicines Found",
            medicines
        })
    } catch (error) {

    }

}


const addToCart = async (req, res) => {
    try {
        const { medicineId } = req.body;
        const userId = req.user;

        if (!medicineId) {
            return res.status(400).json({
                success: false,
                message: "Medicine ID required",
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        let cartMedicine = await cart.findOne({ user: userId });

        if (!cartMedicine) {
            cartMedicine = new cart({
                user: userId,
                items: [
                    {
                        medicine: medicineId,
                        quantity: 1,
                    },
                ],
            });

            await cartMedicine.save();
        } else {

            const itemIndex = cartMedicine.items.findIndex(
                (item) => item.medicine.toString() === medicineId
            );

            if (itemIndex >= 0) {

                cartMedicine.items[itemIndex].quantity += 1;
            } else {
                cartMedicine.items.push({
                    medicine: medicineId,
                    quantity: 1,
                });
            }

            await cartMedicine.save();
        }

        return res.status(200).json({
            success: true,
            message: "Item added successfully",
            cart: cartMedicine,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



const getCartMedicines = async (req, res) => {
    const userId = req.user;
    console.log("User Id", userId);


    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "User Not authorized"
        })
    }

    try {
        let userCart = await cart.findOne({ user: userId })

        if (!userCart) {
            return res.status(400).json({
                success: false,
                message: "No Items found in cart"
            })
        }

        // let medicineId = userCart.item[0].medicine

        // let medicineData = await medicine.findById(medicineId)

        
        
        // if (!medicineData) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "no medicines found with this id"
        //     })
        // }


        let totalMedicines = [];

        for (let i = 0; i < userCart.items.length; i++) {

            let medicineQuantity = userCart.items[i].quantity
            let medicineIdMatch = await medicine.findById(userCart.items[i].medicine)

            if (!medicineIdMatch) return;

            totalMedicines.push({
                medicine : medicineIdMatch,
                quantity : medicineQuantity
            });    
        }


        return res.status(200).json({
            success: true,
            message: "Cart Items fetched successfully",
            cart: totalMedicines
        })
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        })

    }



}

export {
    showMedicines,
    addMedicines,
    addToCart,
    getCartMedicines

}



















//  const fields = {MedicineName, Composiition, CompanyName};

//  if (Object.values(fields).some((item => !item || item.trim() === ""))) {
//     return  res.status(401).json({
//         success : false,
//         message : "All fields are mandatory.."
//     })
//  }

