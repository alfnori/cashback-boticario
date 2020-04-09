
const { validatorCPF } = require('../../utils/validators');
const { statusTags } = require('../../models/schemas/status');
const { userRoles } = require('../../models/schemas/user');
const { envs, get } = require('../../utils/env');
const Status = require('../../models/status');

const validateUserPurchase = (purchase, role, cpf) => {
  let userPurchase = { ...purchase };
  if (userPurchase && userPurchase.cpf) {
    if (role !== userRoles.ADMIN) {
      const purchaseCPF = validatorCPF.strip(purchase.cpf);
      const userCPF = validatorCPF.strip(cpf);
      if (purchaseCPF !== userCPF) {
        userPurchase = null;
      }
    }
  }
  return userPurchase;
};

const newPurchaseData = async (purchaseData) => {
  const newPurchase = { ...purchaseData };
  let newStatus = statusTags.EmValidacao;
  if (newPurchase.cpf === validatorCPF.strip(get(envs.SPECIAL_CPF, '153.509.460-56'))) {
    newStatus = statusTags.Aprovado;
  }
  newPurchase.status = await Status.findByTag(newStatus);
  return newPurchase;
};

module.exports = {
  validateUserPurchase,
  newPurchaseData,
};
