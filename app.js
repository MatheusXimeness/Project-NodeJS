// ----- Carregando Módulos ----- //
    // -- it's like importing libraries -- //
        const express = require('express')
        const handlebars = require('express-handlebars')
        const bodyParser = require("body-parser")
        const app = express()
        const admin = require("./routes/admin") // pegando o arquivo admin que está dentro de routes para dentro da constante admin
        const path = require("path")
        const mongoose = require("mongoose")
        const session = require("express-session")
        const flash = require("connect-flash") //flash é um tipo de sessao que só aparece uma vez, caso a pagina seja recarregada ele irá sumir
        require("./models/Postagens")
        const Postagem = mongoose.model("postagens")
        require("./models/Categoria")
        const Categoria = mongoose.model("categorias")
        const usuarios = require("./routes/usuario")
// -------------------- //

// Tudo que tem "app.use" é nada mais nada menos do que um middleware

// ----- Configurações ----- //

    // -- Session/Flash -- //
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
    // --------- //

    // -- Middleware -- //
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()
        })
    // --------- //
    
    // -- Body Parser -- //
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // --------- //

    // -- Handlebars -- //
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars');
    // --------- //

    // -- Mogoose -- //
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost:27017/blogapp", {useNewUrlParser:true}).then(() => {
            console.log("Conectado ao mongo")
        }).catch((err) => {
            console.log("Erro ao se conectar: " + erro)
        })
    // --------- //

    // -- Public -- //
        // Falando para o express que a nossa página de arquivos estáticos é a pasta public
            app.use(express.static(path.join(__dirname,"public")))

            app.use((req, res, next) => { //criando um middleware (intermediador)
                console.log("Oi, eu sou um middleware!")
                next(); //importante colocar um next pois se não a requisição feita vai parar no middleware e entrar em loop
            })
    // --------- //

// -------------------- //


// ----- Rotas ----- //
    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {  //vai pesquisar uma postagem pelo slug dela e esse slug vai ser passado pelo usuario pelo parametro da rota
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg","Esta postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg","Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) =>{
            
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens) => { //vai pesquisar os posts da categoria que foi passado no slug
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os posts!")
                res.redirect("/")
            })
            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar a página desta categoria")
            res.redirect("/")
        })
    })

    app.get("/mapa", (req, res) => {
        res.render("mapa/TomCat/apache-tomcat-9.0.17/work/Catalina/localhost/projeto/index")
    })

    app.get("/404", (req, res) => {
        res.send('Erro 404!')
    })

    app.use('/admin', admin)
    app.use("/usuarios", usuarios)
// -------------------- //


// ----- Outros ----- //
    const PORT = 8088
    app.listen(PORT, () =>{
        console.log("Servidor rodando na porta 8088! ")
    })
// -------------------- //