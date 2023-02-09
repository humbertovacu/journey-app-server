const express = require("express");
const router = express.Router();
const Step = require("../models/Step.model");

router.post('/steps', (req,res)=>{
    console.log(req.body)
    const { title, description,importance, links, difficulty, notes, image } = req.body

    Step.create({title, description, links, difficulty,importance, notes ,image})
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
            res.json(stepsData)
        })
})

router.put('/steps/:stepsId', (req,res)=>{
    const stepId = req.params.stepsId
    const updatedStepInfo = req.body.step
    console.log("info received")
    console.log(updatedStepInfo)
    Step.findByIdAndUpdate(stepId, updatedStepInfo, {new:true})
        .then(stepUpdated=>{
            res.status(200).json({step: stepUpdated})
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
