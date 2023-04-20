exports.index = (req, res) => {
    res.render('main/index')
};

exports.about = (req, res) => {
    res.render('main/about')
}

exports.contact = (req, res) => {
    res.render('main/contacts')
}

exports.dev = (req, res) => {
    res.render('main/in-dev-page')
}