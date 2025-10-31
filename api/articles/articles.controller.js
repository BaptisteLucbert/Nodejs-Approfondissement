const articlesService = require("./articles.service");
const UnauthorizedError = require("../../errors/unauthorized");

class ArticlesController {
  async create(req, res, next) {
    try {
      // Récupérer l'id de l'utilisateur connecté
      const userId = req.user._id;

      // Ajouter l'utilisateur aux données de l'article
      const articleData = {
        ...req.body,
        user: userId,
      };

      const article = await articlesService.create(articleData);

      // Émettre un événement socket.io
      req.io.emit("article:create", article);

      res.status(201).json(article);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      // Vérifier si l'utilisateur est admin
      if (req.user.role !== "admin") {
        throw new UnauthorizedError("Only admins can update articles");
      }

      const id = req.params.id;
      const articleModified = await articlesService.update(id, req.body);

      // Émettre un événement socket.io
      req.io.emit("article:update", articleModified);

      res.json(articleModified);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      // Vérifier si l'utilisateur est admin
      if (req.user.role !== "admin") {
        throw new UnauthorizedError("Only admins can delete articles");
      }

      const id = req.params.id;
      await articlesService.delete(id);

      // Émettre un événement socket.io
      req.io.emit("article:delete", { id });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ArticlesController();
