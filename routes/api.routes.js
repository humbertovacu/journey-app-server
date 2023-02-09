const express = require("express");
const router = express.Router();
const Step = require("../models/Step.model");
const Block = require("../models/Block.model")

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

// Block Routes

router.post('/:journeyId/blocks', async (req, res)=> {

    const { title, description, category, importance } = req.body;
    const { journeyId } = req.params;

    if(title === "" || category === "" || importance === ""){
        res.status(400).json({message: "Please add a title, a category and select an importance level"})
    };

    Block.create({title, description, category, importance})
        .then(createdBlock => {res.status(201).json(createdBlock.data)})
        //Logic for pushing createdBlock._id into Journey.blocks//;
        .catch(err => {
            res.status(500).json({message: "Internal server error. Please try again."})
        });
})
9

router.get('/:journeyId/blocks', (req, res) => {

    const { journeyId } = req.params;
    
    Journey.findById(journeyId).populate('blocks')
        .then(foundBlocks => {
            res.status(200).json({blocks: foundBlocks})
        .catch(err => {
            res.status(500).json({message: 'Internal server error. Please try again'})
        });
    });
})

router.get('/blocks/:blockId', (req, res) => {

    const { blockId } =  req.params;

    Block.findById(blockId)
        .then(blockFound => {
            console.log(blockFound);
            res.status(200).json({block: blockFound});
        })
        .catch(err => res.status(500).json({message: "Internal Server Error. Please try again."}))  
})

router.put('/blocks/:blockId/', (req, res) => {
    
    const { title, description, category, importance } = req.body;
    const { blockId } = req.params;
    
    Block.findByIdAndUpdate(blockId, {title, description, category, importance}, {new: true})
        .then(updatedBlock => res.status(200).json({block: updatedBlock}))
        .catch(err => res.status(500).json({message: "Internal Server Error. Please try again."}));
        
})

router.post('/blocks/:blockId/delete', (req, res) => {
    
    const { blockId } = req.params;

    Block.findByIdAndDelete(blockId)
        .then(() => res.status(200).json({message: "Block deleted"}))
        .catch(err => res.status(500).json({message: "Internal Server Error. Please try again."}))

})


module.exports = router;
