const express = require("express");
const router = express.Router();
const Step = require("../models/Step.model");
const Block = require("../models/Block.model")
const Journey = require("../models/Journey.model")
const fileUploader = require("../config/cloudinary.config");


router.post('/journeys', (req, res) => {
    
    const { title, description, author, tags, isPublic } = req.body;
    let image = '';

    if(title === '' || description ===  ''){
        res.status(400).json({message: 'Please add a title and a description to your new journey'})
    }

    if(!req.file){
        image = 'https://res.cloudinary.com/djwmauhbh/image/upload/v1676047808/journey-app-assets/journey-default_aay5tv.jpg'
    } else {
        image = req.file.path
    }

    Journey.create({title, description, author, image, tags, isPublic })
        .then(createdJourney => {
            res.status(201).json(createdJourney);
        })
        .catch(err => res.status(500).json({message: 'Internal Server Error. Please try again.'}))

});

router.get('/:journeyId', (req, res) => {
    
    const { journeyId } = req.params;

    Journey.findById(journeyId)
        .then(foundJourney => res.status(200).json(foundJourney))
        .catch(err => res.status(404).json({message: `Sorry, we couldn't find this page.`}));

});

router.put('/:journeyId', async (req, res) =>  {

    const { journeyId } = req.params;
    const { title, description, tags, image, isPublic } = req.body;
   
    let userJourney = await Journey.findById(journeyId);
    userJourney.tags.addToSet(tags);
    await userJourney.save();
    
    Journey.findByIdAndUpdate(journeyId, {title, description, image, isPublic}, {new: true})
        .then(updatedJourney => res.status(200).json(updatedJourney))
        .catch(err => res.status(500).json({message: "Sorry, we couldn't update this journey."}))

});

router.delete('/:journeyId/', (req, res) => {

    const { journeyId } = req.body;
    
    Journey.findByIdAndRemove(journeyId)
        .then(() => res.status(200).json({message: 'This journey has been deleted.'}))
        .catch(err => res.status(500).json({message: `We couldn't delete this journey. Please try again.`}))

})

router.post('/upload', fileUploader.single("imageUrl"), (req, res) => {
    if(!req.file){
        res.status(400).json({message : 'No file uploaded'})
    }

    res.json({imageUrl: req.file.path});

});


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
});

router.get('/steps/:stepsId', (req,res)=>{
    const {stepsId} = req.params
    console.log(stepsId)
    Step.findById(stepsId)
        .then(stepsData=>{
            console.log(stepsData)
            res.json(stepsData)
        })
})

router.put('/steps/:stepsId', (req,res)=>{
    const {stepsId} = req.params
    const {step} = req.body
    console.log("info received")
    console.log(step)
    Step.findByIdAndUpdate(stepsId, step, {new:true})
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
        .then(createdBlock => res.status(201).json(createdBlock))
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

router.delete(':blockId/', (req, res) => {
    
    const { blockId } = req.params;

    Block.findByIdAndRemove(blockId)
        .then(() => res.status(200).json({message: "Block deleted"}))
        .catch(err => res.status(500).json({message: "Internal Server Error. Please try again."}))

})


module.exports = router;
