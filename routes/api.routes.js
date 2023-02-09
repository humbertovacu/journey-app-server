const express = require("express");
const router = express.Router();
const Step = require("../models/Step.model");
const Block = require("../models/Block.model")

router.post('/steps', (req,res)=>{
    console.log(req.body)
    const { title, description,importance, links, difficulty, notes, imageUrl } = req.body

    Step.create({title, description, links, difficulty,importance, notes ,image: imageUrl})
        .then(stepCreated=>{
            console.log("step created in DB")
            console.log(stepCreated)
            res.json({step: stepCreated})

            //Missing: Push the newly created Step into the Block model (steps property) , we can 
            // find the ID of the model through the URL (useParams hook necessary)
        })
  })

router.get('/steps/:stepsId', (req,res)=>{
    const stepId = req.params.stepsId
    console.log(stepId)
    Step.findById(stepId)
        .then(stepsData=>{
            console.log(stepsData)
        })
})

// Block Routes

router.post('/:journeyId/blocks', async (req, res)=> {
    const { title, description, category, importance } = req.body;
    const { journeyId } = req.params;

    if(title === "" || category === "" || importance === ""){
        res.status(400).json({message: "Please add a title, a category and select an importance level"})
    }

    Block.create({title, description, category, importance})
        .then(createdBlock => {res.status(200).json(createdBlock)})
        //Logic for pushing createdBlock._id into Journey.blocks//;
        .catch(err => {
            res.status(500).json({message: "Internal server error. Please try again."})
        })

})


router.get('/blocks/:blockId', (req,res)=>{

    /* Block.find({block._id})
        .populate('steps')
        .then(blockFound=>{
            console.log(blockFound)
            res.json({block:blockFound})
        })
         */

    
})



module.exports = router;
