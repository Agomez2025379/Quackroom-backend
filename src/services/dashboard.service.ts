import { supabase } from '../config/supabase';

export interface DashboardStats {
  citasPorEstado: Record<'solicitada' | 'confirmada' | 'atendida' | 'cancelada', number>;
  promedioNivelAnimo: number;
  usuariosPorRol: { beneficiario: number; profesional: number };
  promedioCalificacion: number;
  categoriasConMasContenido: Array<{
    id_categoria: number;
    nombre_categoria: string;
    total_recursos: number;
  }>;
}

export const dashboardService = {
  async obtenerEstadisticas(): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) throw error;
    return data as DashboardStats;
  },
};