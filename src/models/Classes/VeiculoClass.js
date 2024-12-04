import conectarBancoDeDados from '../../config/db.js';

class Veiculo {
    constructor(pVei) {
        this.id = pVei.id ?? null;
        this.placa = pVei.placa;
        this.marca = pVei.marca;
        this.ano = pVei.ano;
        this.modelo = pVei.modelo;
        this.id_pessoa = pVei.id_pessoa ?? null;
    }

    get Id() { return this.id; }
    set Id(value) { this.id = value; }

    get Placa() { return this.placa; }
    set Placa(value) { this.placa = value; }

    get Marca() { return this.marca; }
    set Marca(value) { this.marca = value; }

    get Ano() { return this.ano; }
    set Ano(value) { this.ano = value; }

    get Modelo() { return this.modelo; }
    set Modelo(value) { this.modelo = value; }

    get Id_pessoa() { return this.id_pessoa; }
    set Id_pessoa(value) { this.id_pessoa = value; }

    // Método para validar os campos do veículo antes de realizar operações no banco
    validarCampos() {
        const campos = {
            placa: this.placa,
            marca: this.marca,
            ano: this.ano,
            modelo: this.modelo,
        };
        for (const [key, value] of Object.entries(campos)) {
            if (!value || (key === 'ano' && isNaN(value))) {
                throw new Error(`O campo ${key} é obrigatório e deve ser válido.`);
            }
        }

        if (!/^([A-Z]{3}-[0-9]{4}|[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2})$/.test(this.placa)) {
            throw new Error('A placa deve estar no formato válido: ABC-1234, ABC1234 ou ABC1D23.');
        }

        if (!/^\d{4}$/.test(this.ano)) {
            throw new Error('O ano deve conter exatamente 4 dígitos.');
        }
        return true;
    };




    // Método para cadastrar um novo veículo no banco de dados
    novoRegistroVeiculo = async (idPessoa) => {
        const con = await conectarBancoDeDados();
        try {
            this.validarCampos();
            const result = await con.query(
                `INSERT INTO tbl_veiculo (placa, marca, ano, modelo, id_pessoa) VALUES (?, ?, ?, ?, ?)`,
                [this.placa, this.marca, this.ano, this.modelo, idPessoa]
            );
            return result[0].insertId;
        } catch (error) {
            throw new Error(`Erro ao registrar veículo: ${error.message}`);
        }
    };





    // Método para selecionar veículos de uma pessoa pelo ID
    static selecionarRegistroVeiculo = async (idPessoa) => {
        const con = await conectarBancoDeDados();
        try {
            const [rows] = await con.query(`SELECT * FROM tbl_veiculo WHERE id_pessoa = ?`, [idPessoa]);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao selecionar: ${error.message}`);
        } finally {
            await con.release();
        }
    };





    // Método para selecionar um veículo pela placa
    static selecionarRegistroVeiculoPorPlaca = async (placa) => {
        const con = await conectarBancoDeDados();
        try {
            const [rows] = await con.query(`SELECT * FROM tbl_veiculo WHERE placa = ?`, [placa]);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao selecionar: ${error.message}`);
        } finally {
            await con.release();
        }
    };




    // Método para atualizar os dados de um veículo no banco de dados
    atualizarRegistroVeiculo = async () => {
        const con = await conectarBancoDeDados();
        try {
            this.validarCampos();
            await con.query(
                `UPDATE tbl_veiculo SET placa = ?, marca = ?, ano = ?, modelo = ? WHERE id = ?`,
                [this.placa, this.marca, this.ano, this.modelo, this.id]
            );
        } catch (error) {
            throw new Error(`Erro ao atualizar veículo: ${error.message}`);
        }
    };







    // Método comentado: seria responsável por excluir um veículo do banco
    static deleteRegistroVei = async (idVei) => {
        const con = await conectarBancoDeDados();
        try {
            const result = await con.query(`DELETE FROM tbl_veiculo WHERE id = ?`, [idVei]);
            return result; 
        } catch (error) {
            throw new Error(`Erro ao excluir veículo: ${error.message}`);
        }
    };


}

export default Veiculo;
