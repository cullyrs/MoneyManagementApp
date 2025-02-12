const express = require("express");
const { initializeCategories, getCategoryName } = require("../db/categoryFunctions");

const router = express.Router();


router.get("/initializeCategories", async (req, res) => {
    try {
        await initializeCategories();
        res.json({ success: true, message: 'Categories have been initialized.' });
    } catch (error) {
        console.error("Error initializing categories:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/categoryName", async (req, res) => {
    try {
        
        const rawParam = req.query.categoryID;
        if (!rawParam) {
            return res.status(400).json({ success: false, message: "Missing categoryID query parameter." });
        }
        
        const cleanParam = rawParam.split(":")[0];
        const categoryID = parseInt(cleanParam, 10);
        
        if (isNaN(categoryID)) {
            return res.status(400).json({ success: false, message: "Invalid categoryID provided." });
        }
        
        const categoryName = await getCategoryName(categoryID);
        if (categoryName) {
            res.json({ success: true, categoryName });
        } else {
            res.status(404).json({ success: false, message: "Category not found" });
        }
    } catch (error) {
        console.error("Error fetching category name:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

//Combined the two above used for all category loads
router.get("/allCategories", async (req, res) => {
    try {
  
        await initializeCategories();
        

        await new Promise(resolve => setTimeout(resolve, 1000));
        
  
        const numCategories = 10;
        let categories = [];
        for (let i = 0; i < numCategories; i++) {
 
            const categoryName = await getCategoryName(i);
            if (categoryName) {
                categories.push({ categoryID: i, name: categoryName });
            } else {
                console.warn(`Category with ID ${i} not found.`);
            }
        }
        
        res.json({ success: true, categories });
    } catch (error) {
        console.error("Error fetching all categories:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


module.exports = router;
