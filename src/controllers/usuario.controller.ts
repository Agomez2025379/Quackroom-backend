export const usuarioController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await usuarioService.listar(req.query as unknown as ListUsuariosQueryDTO);
      res.status(200).json({
        success: true,
        data: resultado.data,
        meta: resultado.meta,
      });
    } catch (error) {
      next(error);
    }
  },
  ...
};
