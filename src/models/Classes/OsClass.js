import conectarBancoDeDados from '../../config/db.js';
import ItemOs from './ItemOsClass.js';

class classOs {
    constructor(pOs) {
        this.id = (pOs.id !== null || pOs.id > 0) ? pOs.id : null;
        this.DataConvert(pOs.data);
        this.status = (pOs.status !== null || pOs.status !== '') ? pOs.status : null;
        this.mo = pOs.mo;
        this.total = pOs.total;
        this.id_veiculo = (pOs.id_veiculo !== null && pOs.id_veiculo > 0) ? pOs.id_veiculo : null;
        this.id_pessoa_veiculo = (pOs.id_pessoa_veiculo !== null && pOs.id_pessoa_veiculo > 0) ? pOs.id_pessoa_veiculo : null;
        this.itens = pOs.itens || [];
        this.id_mecanico = (pOs.id_mecanico !== null && pOs.id_mecanico > 0) ? pOs.id_mecanico : null;
    }
    get Id() { return this.id; }
    set Id(value) { this.id = value; }

    get Data() { return this.data; }
    set Data(value) { this.data = value; }

    get Status() { return this.status; }
    set Status(value) { this.status = value; }

    get Mo() { return this.mo; }
    set Mo(value) { this.mo = value; }

    get Total() { return this.total; }
    set Total(value) { this.total = value; }

    get Id_veiculo() { return this.id_veiculo; }
    set Id_veiculo(value) { this.id_veiculo = value; }

    get Id_pessoa_veiculo() { return this.id_pessoa_veiculo; }
    set Id_pessoa_veiculo(value) { this.id_pessoa_veiculo = value; }

    // Verifica se os campos obrigatórios estão definidos e não são nulos ou vazios
    validarCampos() {
        const campos = {
            Data: this.data,
            Status: this.status,
            Mo: this.mo,
            Total: this.total
        };
        return true;
    }


    DataConvert(data) {
        // Cria um objeto Date a partir da data recebida
        const dataObjeto = new Date(data);
    
        // Verifica se a data é válida
        if (isNaN(dataObjeto)) {
            throw new Error('Data inválida');
        }
    
        // Extrai o ano, mês e dia da data
        const ano = dataObjeto.getFullYear();
        const mes = String(dataObjeto.getMonth() + 1).padStart(2, '0'); // Meses começam do 0, então adiciona 1
        const dia = String(dataObjeto.getDate()).padStart(2, '0'); // Adiciona 0 à esquerda, se necessário
    
        // Formata a data no padrão ISO (yyyy-mm-ddTHH:mm)
        let dataFormatada = `${ano}-${mes}-${dia}`;
    
        console.log("Data formatada:", dataFormatada);
        this.data = dataObjeto;
        return this.data;
    }
    




    //Cria uma nova ordem de serviço no banco de dados.
    async novoRegistroOs(idVei, idPessoaVei) {
        const con = await conectarBancoDeDados();
        try {
            const result = await con.query(
                `INSERT INTO tbl_ordem_de_serviço (data, status, total, mo, id_veiculo, id_pessoa_veiculo, id_mecanico) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [this.data, this.status, this.total, this.mo, idVei, idPessoaVei, this.id_mecanico] // Adiciona o ID do mecânico na inserção
            );
            const idOs = result[0].insertId;
            for (const item of this.itens) {
                const itemOs = new ItemOs({
                    quantidade: item.quantidade,
                    id_produto: item.id_produto,
                    id_os: idOs,
                    id_veiculo_os: idVei,
                    id_pessoa_veiculo_os: idPessoaVei
                });
                await itemOs.adicionarPecaOs(idOs, idVei, idPessoaVei, item.id_produto);
            }

            return idOs;
        } catch (error) {
            throw new Error(`Erro ao registrar OS: ${error.message}`);
        }
    };





    //Recupera veículos e ordens de serviço associados a uma pessoa.
    static selecionarRegistroOs = async (idPessoa) => {
        const con = await conectarBancoDeDados();
        try {
            const [veiculos] = await con.query(`SELECT * FROM tbl_veiculo WHERE id_pessoa = ?`, [idPessoa]);
            const [ordensServico] = await con.query(`SELECT * FROM tbl_ordem_de_serviço WHERE id_pessoa_veiculo = ?`, [idPessoa]);

            return veiculos, ordensServico;
        } catch (error) {
            console.error('Erro ao buscar orçamento:', error);
            return res.status(500).json({ message: `Erro ao buscar orçamento: ${error.message}` });
        }
    };






    //Recupera o tipo de uma pessoa, identificando se ela é um mecânico.
    static selecionarRegistroOsMecanico = async (mecanico) => {
        const con = await conectarBancoDeDados();
        try {
            const result = await con.query(`SELECT tipo FROM tbl_pessoa WHERE id = ?`, [mecanico]);
            return result;
        } catch (error) {
            throw new Error(`Erro ao buscar mecânico: ${error.message}`);
        }
    };




    // Recupera uma lista de ordens de serviço junto com os dados dos veículos e das pessoas.
    static selecionarOrcamentos = async (req, res) => {
        const con = await conectarBancoDeDados();
        try {
            const [ordensServico] = await con.query(`
            SELECT 
              o.id AS id_os, 
              o.data, 
              o.status, 
              o.total, 
              o.mo,
              v.placa, 
              v.modelo, 
              p.id AS id_pessoa,
              p.email
            FROM tbl_ordem_de_serviço o
            INNER JOIN tbl_veiculo v ON o.id_veiculo = v.id
            INNER JOIN tbl_pessoa p ON o.id_pessoa_veiculo = p.id;
          `);
            return ordensServico;
        } catch (error) {
            console.error('Erro ao buscar orçamentos:', error);
            throw new Error(`Erro ao buscar orçamentos: ${error.message}`);
        }
    };




    //Recupera os itens (produtos) de uma ordem de serviço específica.
    static selecionarItensOs = async (idOS) => {
        const con = await conectarBancoDeDados();
        try {
            const result = await con.query(`
            SELECT 
              o.id AS id_os, 
              i.id AS id_itens_os,
              p.nome_produto, 
              p.marca_produto, 
              p.valor_produto,
              i.quantidade
            FROM tbl_ordem_de_serviço o
            LEFT JOIN tbl_itens_os i ON o.id = i.id_os
            LEFT JOIN tbl_produtos p ON i.id_produto = p.id          
            WHERE o.id = ?;`, [idOS]);
            return result;
        } catch (error) {
            console.error('Erro ao buscar peças dessa Os:', error);
            throw new Error(`Erro ao buscar peças dessa Os: ${error.message}`);
        }
    };





    // Atualiza os dados de uma ordem de serviço existente.
    atualizarRegistroOs = async (idOS) => {
        const con = await conectarBancoDeDados();
        try {
            this.validarCampos();
            await con.query(
                `UPDATE tbl_ordem_de_serviço SET data = ?, status = ?, mo = ?, total = ? WHERE id = ?`,
                [this.data, this.status, this.mo, this.total, idOS]
            );
        } catch (error) {
            throw new Error(`Erro ao atualizar OS: ${error.message}`);
        }
    };




    //(comentado): Exclui uma ordem de serviço do banco de dados.
    // static deleteRegistroOs = async (idOS) => {
    //     const con = await conectarBancoDeDados();
    //     try {
    //         const result = await con.query(`DELETE FROM tbl_ordem_de_serviço WHERE id = ?`, [idOS]);
    //         return result;
    //     } catch (error) {
    //         throw new Error(`Erro ao excluir OS: ${error.message}`);
    //     }
    // };

}

export default classOs;