const express = require("express");
const router = express.Router();
const Step = require("../models/Step.model");
const Block = require("../models/Block.model");
const Journey = require("../models/Journey.model");
const fileUploader = require("../config/cloudinary.config");
const User = require("../models/User.model");


router.get('/users/:userId', (req,res)=>{
    const {userId} = req.params
    console.log(userId)
    User.findById(userId).populate('journeysCreated')
        .then(response=>{
            let {_id, username, email, journeysCreated, journeysCopied, journeysCompleted, profilePicture} = response
            res.json({_id, username, email, journeysCreated, journeysCompleted, journeysCopied, profilePicture})
    })
        .catch(err=>console.log(err))
})


router.post('/:userId/journeys', async (req, res) => {
    
    const { title, description, tags, isPublic } = req.body;
    const { userId } = req.params;
    let image = '';

    if(title === '' || description ===  ''){
        res.json({message: 'Please add a title and a description to your new journey'});
    };

    if(!req.file){
        image = 'https://res.cloudinary.com/djwmauhbh/image/upload/v1676047808/journey-app-assets/journey-default_aay5tv.jpg'
    } else {
        image = req.file.path
    }

  let createdJourney = await  Journey.create({title, description, author: userId, image, tags, isPublic }).catch(err=>console.log(err))
  let updatedUser = await  User.findByIdAndUpdate(userId, {$push :{journeysCreated: createdJourney._id}}).populate("journeysCreated").catch(err=>console.log(err))
    res.json({user: updatedUser})
});


router.post('/:userId/journeys', async (req, res) => {
    
    const { title, description, tags, isPublic } = req.body;
    const { userId } = req.params;
    let image = '';

    if(title === '' || description ===  ''){
        res.json({message: 'Please add a title and a description to your new journey'});
    };

    if(!req.file){
        image = 'https://res.cloudinary.com/djwmauhbh/image/upload/v1676047808/journey-app-assets/journey-default_aay5tv.jpg'
    } else {
        image = req.file.path
    }

  let createdJourney = await  Journey.create({title, description, author: userId, image, tags, isPublic }).catch(err=>console.log(err))
  let updatedUser = await  User.findByIdAndUpdate(userId, {$push :{journeysCreated: createdJourney._id}}).populate("journeysCreated").catch(err=>console.log(err))
    res.json({user: updatedUser})
});


router.get('/journeys/:journeyId', (req, res) => {
    
    const { journeyId } = req.params;

    Journey.findById(journeyId).populate({path: 'blocks', populate: {path: 'steps'}})
        .then(foundJourney => res.status(200).json(foundJourney))
        .catch(err => res.status(404).json({message: `Sorry, we couldn't find this page.`}));

});

router.put('/journeys/:journeyId', async (req, res) =>  {

    const { journeyId } = req.params;
    const { title, description, tags, image, isPublic } = req.body;
   
    let userJourney = await Journey.findById(journeyId);
    userJourney.tags.addToSet(tags);
    await userJourney.save();
    
    Journey.findByIdAndUpdate(journeyId, {title, description, image, isPublic}, {new: true})
        .then(updatedJourney => res.status(200).json(updatedJourney))
        .catch(err => res.status(500).json({message: "Sorry, we couldn't update this journey."}))

});

router.delete('/journeys/:journeyId/', (req, res) => {

    const { journeyId } = req.body;
    
    Journey.findByIdAndRemove(journeyId)
        .then(() => res.status(200).json({message: 'This journey has been deleted.'}))
        .catch(err => res.status(500).json({message: `We couldn't delete this journey. Please try again.`}))

})

// CLOUDINARY ROUTE

router.post('/upload', fileUploader.single("imageUrl"), (req, res) => {
    if(!req.file){
        res.status(400).json({message : 'No file uploaded'})
    }

    res.json({imageUrl: req.file.path});

});

// STEP Routes

router.post('/:blockId/steps', async (req,res)=>{
    const {blockId} = req.params
    console.log(blockId)
    const { title, description,importance, links, difficulty, notes, image } = req.body

    if(title === "" || description === "" || links === "" || difficulty === "" || notes === "" || image ===""){
        res.json({message: "Please make sure to fill all the fields"})
    }
    else  {
    let stepCreated = await  Step.create({title, description, links, difficulty,importance, notes ,image})
    console.log(stepCreated)

           await Block.findByIdAndUpdate(blockId, {$push: {steps: stepCreated._id}}, {new:true}).populate('steps')
                .then(blockResponse=>{
                    console.log("block response")
                    console.log(blockResponse)
                    res.json({block: blockResponse, message: "Step successfully created inside Block"})
                })
                        

            //Missing: Push the newly created Step into the Block model (steps property) , we can 
            // find the ID of the model through the URL (useParams hook necessary)
       
    }
  })


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

router.delete('/steps/:stepsId', (req,res)=>{
    const {stepsId} = req.params
    Step.findByIdAndDelete(stepsId)
        .then(stepUpdated=>{
            res.status(200).json({message: "Step deleted"})
        })
})

// Block Routes

router.post('/:journeyId/blocks', async (req, res)=> {

    const { title, description, category, importance } = req.body;
    const { journeyId } = req.params;

    if(title === "" || category === "" || importance === ""){
        res.json({message: "Please add a title, a category and select an importance level"})
    };

    Block.create({title, description, category, importance})
        .then(async createdBlock => {
           let updatedJourney = await Journey.findByIdAndUpdate(journeyId, {$push: {blocks: createdBlock._id}}, {new: true}).populate('blocks')
            res.status(201).json(updatedJourney)})
        .catch(err => {
            res.status(500).json({message: "Internal server error. Please try again."})
        });
});


router.get('/blocks', (req, res) => {

    const { journeyId } = req.params;
    
    Journey.findById(journeyId).populate('blocks')
        .then(foundBlocks => {
            res.status(200).json({blocks: foundBlocks})
        .catch(err => {
            res.status(500).json({message: 'Internal server error. Please try again'})
        });
    });
});


router.get('/blocks/:blockId', (req, res) => {

    const { blockId } =  req.params;

    Block.findById(blockId)
        .populate('steps')
        .then(blockFound => {
            res.status(200).json({block: blockFound});
        })
        .catch(err => res.status(500).json({message: "Internal Server Error. Please try again."}))  
});


router.put('/blocks/:blockId/', (req, res) => {
    
    const { title, description, category, importance } = req.body;
    const { blockId } = req.params;
    
    Block.findByIdAndUpdate(blockId, {title, description, category, importance}, {new: true})
        .then(updatedBlock => res.status(200).json({block: updatedBlock}))
        .catch(err => res.status(500).json({message: "Internal Server Error. Please try again."}));
        
});


router.delete('/:journeyId/blocks/:blockId/', async (req, res) => {
    
    const { blockId } = req.params;
    const {journeyId} = req.params

   await Block.findByIdAndDelete(blockId)
        .then(async () => {
            let newBlocks=[]
            await Journey.findById(journeyId)
                .then(async (journeyFound)=>{
                  let blockToRemove = journeyFound.blocks.find(block=> block == blockId)
                    journeyFound.blocks.splice(journeyFound.blocks.findIndex(block=>block===blockToRemove),1)
                    await Journey.findByIdAndUpdate(journeyId, {blocks: journeyFound.blocks}, {new:true})
                        .then(journeyUpdated=>{
                            res.status(200).json({message: "Block deleted"})
                        })
                })
            
    })
        .catch(err => {
            res.status(500).json({message: "Internal Server Error. Please try again."})
        })

});

// COPY JOURNEY TEST

// router.post('/:userId/:journeyId/', async (req, res)  =>  {
//     const { userId, journeyId } = req.params;
//     const journeyToCopy = await Journey.findById(journeyId).populate('blocks');
//     Journey.create({title: journeyToCopy.title, description: journeyToCopy.description, author: journeyToCopy.author, tags: journeyToCopy.tags, image: journeyToCopy.image})
//         .then(copiedJourney => {
//             User.findByIdAndUpdate(userId, {$push : {journeysCopied: copiedJourney._id}, new: true})
//                 .then(updatedUser => console.log(updatedUser));
//             Promise.all(journeyToCopy.blocks.map(block => {
//                 Block.findById(block_id).populate('steps')
//                     .then(foundBlock => {
//                         Block.create({title: foundBlock.title, description: foundBlock.description, category: foundBlock.category, importance: foundBlock.importance})
//                             .then(newBlock => {
//                                 Journey.findByIdAndUpdate(copiedJourney._id, {$push : {blocks : newBlock._id}, new: true})
//                                     .then(updatedJourney => console.log(updatedJourney))
//                                 Promise.all(block.steps.map(step => {
//                                     Step.create({title: step.title, desciption: step.desciption, links: step.links, difficulty: step.difficulty, importance: step.importance, notes: step.notes, image: step.image})
//                                         .then(newStep => {
//                                             Block.findByIdAndUpdate(newBlock._id, { $push : {steps: newStep._id}, new: true})
//                                             .then(updatedBlock => console.log(updatedBlock))
//                                         })
//                                 }))
//                             })
                        
//                     })
//              }))
//         })
    

//     Journey.findByIdAndUpdate(journeyToCopy._id, { $push: {usersCopying : userId._id}, new: true})
//         .then(updatedJourney => console.log(updatedJourney))
    
// })


module.exports = router;
