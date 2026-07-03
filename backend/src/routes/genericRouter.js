const express = require('express');


const createGenericRouter = (controller, authMiddleware = []) => {
  const router = express.Router();


  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', ...authMiddleware, controller.create);
  router.put('/:id', ...authMiddleware, controller.update);
  router.patch('/:id/status', ...authMiddleware, controller.update); 
  router.delete('/:id', ...authMiddleware, controller.delete);
  router.post('/bulk', ...authMiddleware, controller.bulkAction);

  return router;
};

module.exports = { createGenericRouter };
