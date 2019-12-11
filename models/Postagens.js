const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        type: String,
        required:  true
    },
    slug: {
        type: String,
        required:  true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: { // relacionando uma categoria que já existe, armazendo o ID
        type: Schema.Types.ObjectId, // isso quer dizer que a categoria vai armazenar o ID de algum objeto
        ref: "categorias", //passando o nome que eu dei para o model 
        required: true
    },
    data: {
        type:Date,
        default: Date.now(),
    }
})

mongoose.model("postagens", Postagem) //criando uma collection postagens que vai ser feita com base no Model Postagem