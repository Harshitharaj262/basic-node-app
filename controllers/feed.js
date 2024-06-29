exports.getFeeds = (req,res, next)=>{
    try {
        res.status(200).json({title: 'First Post', content: 'This is first post'})
    } catch (error) {
       res.status(500).json({ error: error.message})
    }
}

exports.postFeeds = (req, res, next)=>{
    try {
        const title = req.body.title
        const content = req.body.content
        res.status(201).json({
            message: 'feed created successfully',
            post:{id: new Date().toISOString(),title: title,content: content}
        }) 
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}