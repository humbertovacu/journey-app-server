const express = require("express");
const router = express.Router();
const Step = require("../models/Step.model");
const Block = require("../models/Block.model");
const Journey = require("../models/Journey.model");
const fileUploader = require("../config/cloudinary.config");
const User = require("../models/User.model");

// USER Routes

router.get('/users/:userId', (req,res)=>{
    const {userId} = req.params
    console.log(userId)
    User.findById(userId).populate({
        path: 'journeysCreated',
        populate: {
          path: 'author',
          model: 'User'
        }
    }).populate({
        path: 'journeysCopied',
    populate: {
      path: 'author',
      model: 'User'
    }})
        .then(response=>{
            console.log(response.journeysCopied)
            let {_id, username, email, journeysCreated, journeysCopied, journeysCompleted, profilePicture} = response
            res.json({_id, username, email, journeysCreated, journeysCompleted, journeysCopied, profilePicture})
    })  
        .catch(err=>console.log(err))
})

router.get('/users', (req,res)=>{
    User.find().populate("journeysCreated").populate({
        path: 'journeysCreated',
        populate: {
          path: 'blocks',
          model: 'Block'
        }
    })
        .then(response=>{
            console.log(response)
            res.json({users: response})
        })

})

// JOURNEY Routes

router.post('/:userId/journeys', async (req, res) => {
    
    const { title, description, tags, isPublic, image, category } = req.body;
    const { userId } = req.params;
    let imageToUpload = ''

    if(title === '' || description ===  ''){
        res.json({message: 'Please add a title and a description to your new journey'});
    };

    if(!image){
        imageToUpload = 'https://res.cloudinary.com/djwmauhbh/image/upload/v1676047808/journey-app-assets/journey-default_aay5tv.jpg'
    } else {
        imageToUpload = image
    }

  let createdJourney = await  Journey.create({title, description, author: userId, image: imageToUpload, tags, isPublic, category }).catch(err=>console.log(err))
  let updatedUser = await  User.findByIdAndUpdate(userId, {$push :{journeysCreated: createdJourney._id}}, {new:true}).populate("journeysCreated journeysCopied").catch(err=>console.log(err))
    res.json({user: updatedUser, journey: createdJourney})
});

router.get('/journeys', (req,res)=>{
    Journey.find().populate('blocks author')
        .then(async (journeysArray)=>{
            let publicJourneys = await journeysArray.filter(journey=>{
                return journey.isPublic === true
            })
            res.json({publicJourneys: publicJourneys})
        })
})

router.get('/journeys/:journeyId', (req, res) => {
    
    const { journeyId } = req.params;

    Journey.findById(journeyId).populate({path: 'blocks', populate: {path: 'steps'}}).populate('author')
        .then(foundJourney => res.status(200).json(foundJourney))
        .catch(err => res.status(404).json({message: `Sorry, we couldn't find this page.`}));

});

router.put('/journeys/:journeyId', async (req, res) =>  {

    const { journeyId } = req.params;   
    const { title, description, tags, image, isPublic, userId } = req.body;
    
    Journey.findByIdAndUpdate(journeyId, {title, description, image, isPublic, tags}, {new: true})
        .then(updatedJourney => {
            console.log(updatedJourney)
            res.status(200).json(updatedJourney)
        })
        .catch(err => res.status(500).json({message: "Sorry, we couldn't update this journey."}))

});

router.delete('/journeys/:journeyId/', async (req, res) => {

    const { journeyId } = req.params;

    const deleteFromUser = await User.updateOne({journeysCreated: journeyId}, {$pull: {'journeysCreated': journeyId}}, {new: true})
                                    .then(updatedUser => console.log(`removed from ${updatedUser}`));
    
    Journey.findByIdAndDelete(journeyId)
        .then(() => res.status(200).json({message: 'This journey has been deleted.'}))
        .catch(err => res.status(500).json({message: `We couldn't delete this journey. Please try again.`}))

})
// JOURNEY LIKES ROUTES

router.post('/journeys/:journeyId/like', async (req, res) => {
    const { journeyId } = req.params;
    const { userId } = req.body;
  console.log("starting")
    try {
      const userFound = await User.findById(userId)
      const journeyToUpdate = await Journey.findById(journeyId)
        
      if (journeyToUpdate.upvoteUsers.includes(userId)) {
        console.log("original user array")
        console.log(userFound)
        journeyToUpdate.upvoteUsers = journeyToUpdate.upvoteUsers.filter(user => user.toString() !== userId)
        userFound.journeysCopied = userFound.journeysCopied.filter(journey => journey.toString() !== journeyId)
        console.log("user array updated")
        console.log(userFound)
        const updatedJourney = await journeyToUpdate.save()
        const updatedUser = await userFound.save()

  
        res.json({ journey: updatedJourney })
      } else {
        journeyToUpdate.upvoteUsers.push(userId)
        userFound.journeysCopied.push(journeyId)
        const updatedJourney = await journeyToUpdate.save()
        const updatedUser = await userFound.save()
  
        res.json({ journey: updatedJourney })
      }
    } catch (err) {
      res.json({ error: err.message })
    }
  });

  router.delete('/journeys/:journeyId/like/:userId', async (req, res) => {
    const { journeyId, userId } = req.params;
  
    try {
      const journey = await Journey.findById(journeyId);
      const userFound = await User.findById(userId)
      if (!journey) {
        return res.status(404).json({ message: 'Journey not found' });
      }
  
      const userIndex = journey.upvoteUsers.indexOf(userId);
      const journeyIndex = userFound.journeysCopied.indexOf(journeyId)
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User has not liked this journey' });
      }
  
      journey.upvoteUsers.splice(userIndex, 1);
      userFound.journeysCopied.splice(journeyIndex, 1)
      const updatedJourney = await journey.save();
      const updatedUser = await userFound.save();

  
      res.json({ journey: updatedJourney });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  });



// CLOUDINARY ROUTE

router.post('/upload', fileUploader.single("imageUrl"), (req, res) => {
    if(!req.file){
        res.status(400).json({message : 'No file uploaded'})
    }
    res.json({imageUrl: req.file.path});

});

// STEP Routes

router.post('/:blockId/steps', async (req,res)=>{
    const {blockId} = req.params;
    const { title, description,importance, links, difficulty, notes, image } = req.body;
    let imageToUpload = '';

    if(!image) {
        imageToUpload = 'https://res.cloudinary.com/djwmauhbh/image/upload/v1677010979/journey-app-assets/pexels-caio-46274_sxtpog.jpg'
    } else {
        imageToUpload = image;
    };

    if(title === "" || description === "" || links === "" || difficulty === "") {
        res.json({message: "Please make sure to fill all the fields"})
    }
    else  {
    let stepCreated = await  Step.create({title, description, links, difficulty, importance, notes, image: imageToUpload})

           await Block.findByIdAndUpdate(blockId, {$push: {steps: stepCreated._id}}, {new:true}).populate('steps')
                .then(blockResponse=>{
                    console.log("block response")
                    console.log(blockResponse)
                    res.json({block: blockResponse, message: "Step successfully created inside Block", step: stepCreated })
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
    const { stepsId } = req.params
    const { title, description, importance, links, difficulty, notes, image, isCompleted } = req.body;
    Step.findByIdAndUpdate(stepsId, {title, description, importance, links, difficulty, notes, image, isCompleted}, {new:true})
        .then(stepUpdated=>{
            res.status(200).json(stepUpdated)
        });
})

router.delete('/steps/:blockId/:stepsId', async (req,res)=>{
    const {stepsId, blockId} = req.params
    await Step.findByIdAndDelete(stepsId)
        .then(async (stepUpdated)=>{
            await Block.findById(blockId)
                .then(async (blockFound)=>{
                    let stepToRemove = blockFound.steps.find(step=> step == stepsId)
                    blockFound.steps.splice(blockFound.steps.findIndex(step=>step===stepToRemove),1)
                    await Block.findByIdAndUpdate(blockId, {steps: blockFound.steps}, {new:true})
                        .then(blockUpdated=>{
                            res.status(200).json({message: "Step deleted"})
                        })  
                })
            
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

router.get('/:blockId', (req, res) => {

    const { blockId } = req.params;
    
    Journey.findOne({blocks: blockId})
        .then(response => res.status(200).json(response))
        
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
    
    const { title, description, category, importance, isCompleted } = req.body;
    const { blockId } = req.params;
    
    Block.findByIdAndUpdate(blockId, {title, description, category, importance, isCompleted}, {new: true})
        .then(updatedBlock => res.status(200).json({block: updatedBlock}))
        .catch(err => res.status(500).json({message: "Internal Server Error. Please try again."}));
        
});


router.delete('/:journeyId/blocks/:blockId/', async (req, res) => {
    
    const { blockId } = req.params;
    const { journeyId } = req.params;

   await Block.findByIdAndDelete(blockId)
        .then(async () => {
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
