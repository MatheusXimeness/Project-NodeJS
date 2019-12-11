//é uma boa prática de programação separar as rotas visto que haverão muitas
//o nodejs permite que voce faça isso
//aqui se define um grupo de rotas, para acessar pela url precisará de um prefixo antes de cada rota aqui criada, neste caso será "/admin/posts" por exemplo
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose") //carregando o mongoose
require("../models/Categoria") // carregando model, chamando o model
const Categoria = mongoose.model("categorias") //passa a referencia do model criado para uma variavel
require("../models/Postagens")
const Postagem = mongoose.model("postagens")

router.get('/', (req,res) => {
    res.render("admin/index")
})

router.get("/categorias", (req,res) => {
    Categoria.find({}).sort({date:'desc'}).then((categorias) => { //Pegando o model categoria e usando o metodo find que tem como função listar todas as categorias que existem, a função sort ordena pela data
        res.render("admin/categorias", {categorias: categorias}) // passando as categorias para a página
    }).catch((err) => {
        console.log("houve um erro ao listar")
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get("/categorias/add", (req,res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", (req,res) => {

    // -- Validação de Formulário -- //
        var erros = [];
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido"}) // adicionando um item no array de erros
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido"})
        }
        if(req.body.nome.length <  2 || req.body.slug.length < 2){
            erros.push({texto: "Nome muito pequeno"})
        }
        if(erros.length > 0){
            res.render("admin/addcategorias", {erros: erros}) //é possível passar dados para a view que foi explicitada no parametro
        }
    // -------- //
    else{    
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso") //passando o segundo parametro como conteudo, ja que o primeiro é uma variavel
            res.redirect("/admin/categorias") // se o cadastro ocorrer com sucesso ele irá nos redirecionar para a rota "admin/categorias"
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente") //passando o segundo parametro como conteudo, ja que o primeiro é uma variavel global
            res.redirect("/admin")
        })
    }
})

router.get("/categorias/edit/:id", (req, res) => {
    Categoria.findOne({_id:req.params.id}).then((categoria) => { //findOne - procure o registro para mim que tenha o id igual ao id passado na linha anterior. Params - estamos trabalhando com parametros e não formularios, logo nao se deve usar body e sim params
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg","Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", (req, res) => {
    
    // --- Pequena validação de dados --- //
        var erros = [];
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido"}) // adicionando um item no array de erros
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido"})
        }
        if(req.body.nome.length <  2 || req.body.slug.length < 2){
            erros.push({texto: "Nome muito pequeno"})
        }
        if(erros.length > 0){
            res.render("admin/addcategorias", {erros: erros}) //é possível passar dados para a view que foi explicitada no parametro
        }
    // ----------- //

    else{Categoria.findOne({_id: req.body.id}).then((categoria) => { // procurando dentro de find um post que tenha o id que foi passado no formulario

            categoria.nome = req.body.nome // vai pegar o campo "nome" da categoria que a gente quer editar e vai atribuir a esse campo exatamente o valor que esta vindo la do formulario de edição
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
                res.redirect("/admin/categorias")
            })

        }).catch((err) => {
            req.flash("error_msg" ,"Houve um erro ao editar a categoria")
            res.redirect("/admin/categorias")
        })
    }
})

router.post("/categorias/deletar", (req,res) => { //removendo uma categoria com um certo ID, informação ta vindo do formulario e o body tem a função de pegar o conteudo vindo da página, por isso o usamos
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {  //descrição da funcionalidade da função populate no caderno, o argumento passado a ela tem que ser o mesmo do nome da coluna da collection
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        req.redirect("/admin")
    })
})

router.get("/postagens/add", (req, res) => {
    Categoria.find({}).then((categorias) => { // retorna todas as categorias
        res.render("admin/addpostagens", {categorias: categorias})  // vai passar todas as categorias para dentro da view de postagens 
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })    
})

router.post("/postagens/nova", (req,res) => {
    var erros = []
    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria invália, registre uma categoria"})
    }
    if(erros.length>0){
        res.render("admin/addpostagens", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", (req, res) => { //fazendo uma busca dentro de uma busca, pois na utilização do model postagens, usa-se o model categorias

    Postagem.findOne({_id: req.params.id}).then((postagem) => {

        Categoria.find().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem:postagem}) //reideriza a view em questão
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })  
})

router.post("/postagens/edit", (req,res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => { //pesquisando uma postagens que tenha o id igual ao id que estou passando no formulário, por isso o body
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => { //caso a postagem tenha sido salva com sucesso faça isso:
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a edição")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})

router.get(("/postagens/deletar/:id"), (req, res) => { //este é um jeito alternativo de deletar as postagens utilizando metodo get, o qual nao é muito seguro e não é recomendado, está aqui apenas para abranger o conhecimento, por isso quando for deletar é bom que se use o metodo post, como foi mostrado ao deletar as categorias
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")
    })
})

module.exports = router