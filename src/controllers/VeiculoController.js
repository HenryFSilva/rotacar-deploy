import Veiculo from '../models/Classes/VeiculoClass.js';
import conectarBancoDeDados from '../config/db.js'



const VeiculoController = {
    // Função para registrar um novo veículo
    async registroDeVeiculo(req, res) {
        const { placa, marca, ano, modelo } = req.body;
        const idPessoa = req.params.idPessoa;

        if (!placa || !marca || !ano || !modelo || !idPessoa) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }
        const veiculo = new Veiculo({ placa, marca, ano, modelo });
        try {
            await veiculo.novoRegistroVeiculo(idPessoa);
            return res.status(201).json({ message: 'Veículo registrado com sucesso!' });
        } catch (error) {
            console.error(error);
            if (error.message.includes('obrigatório') || error.message.includes('dígitos')) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Erro interno ao registrar veículo. Tente novamente mais tarde.' });
        }
    },





    // Função para buscar os veículos de uma pessoa, utilizando o ID da pessoa da URL
    async buscarVeiculosPorPessoa(req, res) {
        const idPessoa = req.params.idPessoa;
        const result = await Veiculo.selecionarRegistroVeiculo(idPessoa);
        if (!idPessoa) {
            return res.status(400).json({ message: 'ID da pessoa é obrigatório.' });
        }
        try {
            if (result.length > 0) {
                return res.json({
                    person: result
                });
            } else {
                return res.json({ selectMessage: `Usuário não encontrado` });
            }
        } catch (e) {
            console.error(e);
            return res.json({ selectMessage: `Usuário não foi localizado, motivo: ${e.message}` });
        }
    },





    // Função para buscar um veículo pelo número da placa
    async buscarVeiculoPorPlaca(req, res) {
        const placa = req.body.placa;
        const result = await Veiculo.selecionarRegistroVeiculoPorPlaca(placa);
        if (!placa) {
            return res.status(400).json({ message: 'Placa do veiculo é obrigatório.' });
        }
        try {
            if (result.length > 0) {
                return res.json({
                    person: result[0]
                });
            } else {
                return res.json({ selectMessage: `Veiculo não encontrado` });
            }
        } catch (e) {
            console.error(e);
            return res.json({ selectMessage: `Veiculo não foi localizado, motivo: ${e.message}` });
        }
    },






    // Função para editar as informações de um veículo
    async editarVeiculo(req, res) {
        const idVei = req.params.id;
        const { placa, marca, ano, modelo } = req.body;

        if (!placa || !marca || !ano || !modelo) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const veiculo = new Veiculo({ id: idVei, placa, marca, ano, modelo });

        try {
            veiculo.validarCampos();

            await veiculo.atualizarRegistroVeiculo();
            return res.json({ message: 'Veículo atualizado com sucesso!' });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: error.message });
        }
    },





    //Função comentada para deletar um veículo 
    async deletarVeiculo(req, res) {
        const idVei = req.params.id;

        try {
            const resultado = await Veiculo.deleteRegistroVei(idVei);
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ message: 'Veículo não encontrado.' });
            }
            return res.json({ message: 'Veículo deletado com sucesso!' });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: `Erro ao deletar veículo: ${error.message}` });
        }
    }
}


export default VeiculoController;
