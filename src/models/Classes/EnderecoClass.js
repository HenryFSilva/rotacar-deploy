import conectarBancoDeDados from '../../config/db.js';

class Endereco {

    constructor(pEnd) {

        this.id = (pEnd.id !== null || pEnd.id > 0) ? pEnd.id : null;
        this.logradouro = pEnd.logradouro;
        this.bairro = pEnd.bairro;
        this.estado = pEnd.estado;
        this.numero = pEnd.numero;
        this.complemento = pEnd.complemento;
        this.cep = pEnd.cep;
        this.id_pessoa = (pEnd.id_pessoa !== null || pEnd.id_pessoa > 0) ? pEnd.id_pessoa : null;
    }
    get Id() { return this.id; }
    set Id(value) { this.id = value; }

    get Logradouro() { return this.logradouro; }
    set Logradouro(value) { this.logradouro = value; }

    get Numero() { return this.numero; }
    set Numero(value) { this.numero = value; }

    get Bairro() { return this.bairro; }
    set Bairro(value) { this.bairro = value; }

    get Complemento() { return this.complemento; }
    set Complemento(value) { this.complemento = value; }

    get Cep() { return this.cep; }
    set Cep(value) { this.cep = value; }

    get Estado() { return this.estado; }
    set Estado(value) { this.estado = value; }

    get Id_pessoa() { return this.id_pessoa; }
    set Id_pessoa(value) { this.id_pessoa = value; }


    // Método para validar se todos os campos obrigatórios estão preenchidos
    validarCampos() {
        return (
            this.logradouro &&
            this.bairro &&
            this.estado &&
            this.numero &&
            this.complemento &&
            this.cep
        );
    };


    // Métodopara validar o formato do CEP
    static validarCEP(cep) {
        return /^\d{8}$/.test(cep);
    };




    // Método para registrar um novo endereço no banco de dados
    novoRegistroEnd = async (idPessoa) => {

        const con = await conectarBancoDeDados();
        try {
            const endereco = await con.query(`insert into tbl_endereco (logradouro, bairro, estado, numero, complemento, cep, id_pessoa) VALUES (?,?,?,?,?,?,?)`,
                [this.logradouro, this.bairro, this.estado, this.numero, this.complemento, this.cep, idPessoa]);

            return endereco[0].insertId;
        } catch (error) {
            throw new Error(`Erro ao registrar: ${error.message}`);
        } finally {
            con.release();
        }
    };









    // static deleteRegistroEnd = async (idEndereco) => {

    //     const con = await conectarBancoDeDados();
    //     try {
    //         const person = await con.query(`delete from tbl_endereco where id_pessoa = ?`,
    //             [idEndereco]);
    //         return person;
    //     } catch (error) {
    //         throw new Error(`Erro ao registrar: ${error.message}`);
    //     }
    // };






    // Método para atualizar os dados de um endereço existente
    atualizarRegistroEnd = async () => {
        const con = await conectarBancoDeDados();
        try {
            await con.query(`UPDATE tbl_endereco SET logradouro = ?, bairro = ?, estado = ?, numero = ?, complemento = ?, cep = ? WHERE id_pessoa = ?`,
                [this.logradouro, this.bairro, this.estado, this.numero, this.complemento, this.cep, this.id]);
        } catch (error) {
            throw new Error(`Erro ao atualizar: ${error.message}`);
        }
    };

}

export default Endereco;