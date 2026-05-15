import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom';
import  BasicLayout  from '../layouts/BasicLayout';
import  HomePage  from '../pages/HomePage';
import { ErrorPage } from '../pages/ErrorPage';
import  Servicios  from '../pages/Services';
import  UsPage  from '../pages/UsPage';
import { Staff } from '../pages/Staff';
import { ContactUs } from '../pages/ContactUs';
import { AreaInfantilPage } from '../pages/areas/AreaInfantilPage';
import { Loading } from '../components/Loading/Loading';
import  TerapiaLenguajePage  from '../pages/services-infantil/TerapiaLenguajePage';
import  TerapiaOcupacionalPage  from '../pages/services-infantil/TerapiaOcupacionalPage';
import  PsicologiaInfantilPage  from '../pages/services-infantil/PsicologiaInfantilPage';
import  EvaluacionPsicologicaColegioPage  from '../pages/services-infantil/EvaluacionPsicPage';
import  OrientacionVocacionalPage  from '../pages/services-infantil/OrientacionVocacionalPage';
import { AreaAdultosPage } from '../pages/areas/AreaAdultosPage';
import { AdultoPsicologiaIndividualPage } from '../pages/service-adulto/AdultoPsicologiaIndividualPage';
import  AdultoTerapiaParejaPage  from '../pages/service-adulto/AdultoTerapiaParejaPage';
import  AdultoTerapiaFamiliarPage  from '../pages/service-adulto/AdultoTerapiaFamiliarPage';
import  AdultoTerapiaLenguajePage  from '../pages/service-adulto/AdultoTerapiaLenguajePage';
import { TerminosCondiciones } from '../pages/TerminosCondiciones';
import  TrabajaNosotros  from '../pages/TrabajaNosotros';
import  TerapiaAprendizajePage  from '../pages/services-infantil/TerapiaAprendizajePage';
import { ListaPacientes } from '../pages/ListaPacientes';
import Preguntas from '../pages/Preguntas';
import { ReportesEvaluaciones } from '../pages/ReportesEvaluaciones';
import RegistroPacientePage from '../pages/RegistroPacientePage';
import EditarPacientePage from '../pages/EditarPacientePage';
import  AdultoEvalPsicolUniverPage  from '../pages/service-adulto/AdultoEvalPsicolUniverPage';
import Sidebar, { SidebarProvider, SidebarContentWrapper } from '../components/Sidebar';
import Login from '../components/Login';
import PrivateRoute from '../components/PrivateRoute';
import GeofencingGuard from '../components/GeofencingGuard';

import MiPerfil from '../pages/MiPerfil';
import Agenda from '../pages/Agenda';
import ReglamentoInterno from '../pages/ReglamentoInterno';
import TestUbicacion from '../pages/TestUbicacion';
import PoliticaPrivacidad from '../pages/PoliticaPrivacidad';
import Mantenimiento from '../pages/Mantenimiento';
import LibroReclamaciones from '../pages/LibroReclamaciones';
import VerificarDocumentos from '../pages/VerificarDocumento';
import ArchivosOficiales from '../pages/ArchivosOficiales';
import BlogPage from '../pages/BlogPage';
import BlogDetailPage from '../pages/BlogDetailPage';

import GestionPopup from '../pages/GestionPopup';
import PostulacionesDashboard from '../pages/PostulacionesDashboard';
import VerificarBeneficios from '../pages/VerificarBeneficios';

// Páginas de RR.HH.
import EmpleadosPage from '../pages/rrhh/EmpleadosPage';
import GratificacionesPage from '../pages/rrhh/GratificacionesPage';
import HistorialPagosPage from '../pages/rrhh/HistorialPagosPage';
import DashboardRRHH from '../pages/rrhh/DashboardRRHH';
import CumpleanosTrabajadores from '../pages/rrhh/CumpleanosTrabajadores';
import VacacionesPage from '../pages/rrhh/VacacionesPage';
import ConveniosPage from '../pages/ConveniosPage';
import GestionStaff from '../pages/GestionStaff';
import SorteoPacientes from '../pages/SorteoPacientes';

// Páginas de Auditoría
import HistorialAuditoria from '../pages/Auditoria/HistorialAuditoria';

// Páginas de Asistencias
import AsistenciasPorTerapeuta from '../pages/Asistencias/AsistenciasPorTerapeuta';
import AsistenciasPorPaciente from '../pages/Asistencias/AsistenciasPorPaciente';
import Inconsistencias from '../pages/Asistencias/Inconsistencias';
import SesionesPage from '../pages/Asistencias/SesionesPage';
import GestionAsistenciasAdmin from '../pages/Asistencias/GestionAsistenciasAdmin';
import ProductosTab from '../pages/Inventario/Productostab';
import CategoriasTab from '../pages/Inventario/Categoriastab';
import ProveedoresTab from '../pages/Inventario/Proveedorestab';
import ReposicionTab from '../pages/Inventario/Reposiciontab';
import VenderServiciosTab from '../pages/Ventas/VenderServiciosTab';
import VenderProductosTab from '../pages/Ventas/VenderProductosTab';
import HistorialVentasTab from '../pages/Ventas/HistorialVentasTab';
import ReportesVentas from '../pages/Ventas/ReportesVentas';
import TarifasTab from '../pages/Inventario/Tarifastab';
import PromocionesPage from '../pages/Promociones/PromocionesPage';
import TarifarioPage from '../pages/Tarifario/TarifarioPage';

import RegistrarReclamo from '../pages/LibroReclamaciones/RegistrarReclamo';
import ConsultarReclamo from '../pages/LibroReclamaciones/ConsultarReclamo';
import PanelAdmin from '../pages/LibroReclamaciones/PanelAdmin';
import Pagos from '../pages/Pagos';
import GestorCampanas from '../pages/Campanas/GestorCampanas';
import { Campanas } from '../pages/Campanas/Campanas';
import GestionInformesPage from '../pages/Informes/GestionInformesPage';
import CentroOperativo from '../pages/CentroOperativo/CentroOperativo';
import ReporteActividades from '../pages/CentroOperativo/ReporteActividades';

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/intranet" element={<Login />} />
        <Route path="/test-ubicacion" element={<TestUbicacion />} />
     
        <Route path="/intranet/lista-pacientes" element={
          <PrivateRoute>
            <GeofencingGuard>
              <SidebarProvider>
                <Sidebar />
                <SidebarContentWrapper>
                  <ListaPacientes />
                </SidebarContentWrapper>
              </SidebarProvider>
            </GeofencingGuard>
          </PrivateRoute>
        } />
        <Route path="/intranet/reportes-evaluaciones" element={
          <PrivateRoute>
            <GeofencingGuard>
              <SidebarProvider>
                <Sidebar />
                <SidebarContentWrapper>
                  <ReportesEvaluaciones />
                </SidebarContentWrapper>
              </SidebarProvider>
            </GeofencingGuard>
          </PrivateRoute>
        } />
        <Route path="/intranet/mi-perfil" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <MiPerfil />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/agenda" element={
          <PrivateRoute>
          
              <SidebarProvider>
                <Sidebar />
                <SidebarContentWrapper>
                  <Agenda />
                </SidebarContentWrapper>
              </SidebarProvider>
      
          </PrivateRoute>
        } />
        <Route path="/intranet/postulaciones" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <PostulacionesDashboard />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
         <Route path="/intranet/archivos-oficiales" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <ArchivosOficiales />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        {/* Rutas de RR.HH. */}
        <Route path="/intranet/rrhh/dashboard" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <DashboardRRHH />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/rrhh/empleados" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <EmpleadosPage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/rrhh/gratificaciones" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <GratificacionesPage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/rrhh/historial" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <HistorialPagosPage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/rrhh/vacaciones" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <VacacionesPage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/rrhh/cumpleanos" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <CumpleanosTrabajadores />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/auditoria" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <HistorialAuditoria />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        {/* Rutas de Asistencias */}
        <Route path="/intranet/asistencias/terapeuta" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <AsistenciasPorTerapeuta />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/asistencias/paciente" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <AsistenciasPorPaciente />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/asistencias/inconsistencias" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <Inconsistencias />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/asistencias/sesiones" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <SesionesPage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        {/* Ruta desactivada - Funcionalidad integrada en Inconsistencias */}
        {/* <Route path="/intranet/asistencias/admin" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <GestionAsistenciasAdmin />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } /> */}

        <Route path="/intranet/popup-promocional" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <GestionPopup />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/editar-paciente/:id" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <EditarPacientePage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/convenios" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <ConveniosPage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/gestion-staff" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <GestionStaff />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/sorteo" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <SorteoPacientes />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />


        
        {/* ── INVENTARIO ────────────────────────────────────────── */}
        <Route path="/intranet/inventario/productos" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <ProductosTab />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/inventario/categorias" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <CategoriasTab />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/inventario/proveedores" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <ProveedoresTab />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/inventario/reposicion" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <ReposicionTab />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
          <Route path="/intranet/inventario/servicios" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <TarifasTab />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        {/* ── PROMOCIONES ────────────────────────────────────────── */}
        <Route path="/intranet/promociones" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <PromocionesPage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        {/* ── TARIFARIO ────────────────────────────────────────── */}
        <Route path="/intranet/tarifario" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <TarifarioPage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        {/* ── VENTAS ────────────────────────────────────────── */}
        <Route path="/intranet/ventas/servicios" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <VenderServiciosTab />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/ventas/productos" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <VenderProductosTab />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/ventas/historial" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <HistorialVentasTab />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/ventas/reportes" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <ReportesVentas />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/libro-reclamaciones" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <PanelAdmin />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/campanas" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <GestorCampanas />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/intranet/informes" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <GestionInformesPage />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        {/* ── CENTRO OPERATIVO ────────────────────────────────────── */}
        <Route path="/intranet/centro-operativo" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <CentroOperativo />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/centro-operativo/reporte" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <ReporteActividades />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />

        <Route path="/preguntas" element={<Preguntas />} />
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="nosotros" element={<UsPage />} />
          <Route path="servicios" element={<Servicios/>} />
          <Route path="staff" element={<Staff />} />
          <Route path="contactanos" element={<ContactUs />} />
          <Route path="area-infantil-adolescentes" element={<AreaInfantilPage />} /> 
          <Route path="area-adultos" element={<AreaAdultosPage />} /> 
          <Route path="infantil-terapia-lenguaje" element={<TerapiaLenguajePage />} />      
          <Route path="infantil-terapia-ocupacional" element={<TerapiaOcupacionalPage />} />      
          <Route path="infantil-terapia-aprendizaje" element={<TerapiaAprendizajePage />} />      
          <Route path="infantil-psicologia-infantil" element={<PsicologiaInfantilPage />} />      
          <Route path="infantil-evaluacion-psicologica-colegio" element={<EvaluacionPsicologicaColegioPage />} />      
          <Route path="infantil-orientacion-vocacional" element={<OrientacionVocacionalPage />} />      
          <Route path="adulto-psicologia-individual" element={<AdultoPsicologiaIndividualPage />} />
          <Route path="adulto-terapia-pareja" element={<AdultoTerapiaParejaPage />} />
          <Route path="adulto-terapia-familiar" element={<AdultoTerapiaFamiliarPage />} />
          <Route path="adulto-terapia-lenguaje" element={<AdultoTerapiaLenguajePage />} />
          <Route path="adulto-evaluacion-psicologica-universidad" element={<AdultoEvalPsicolUniverPage />} />
          <Route path="terminos-condiciones" element={<TerminosCondiciones />} />
          <Route path="mantenimiento" element={<Mantenimiento />} />

          <Route path="reglamento-interno" element={<ReglamentoInterno />} />
          <Route path="politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="trabaja-nosotros" element={<TrabajaNosotros />} />
          <Route path="registro-paciente" element={<RegistroPacientePage />} />
          <Route path="verificar-documento" element={<VerificarDocumentos />} />
          <Route path="verificar-beneficios" element={<VerificarBeneficios />} />

          {/* Libro de Reclamaciones */}
          <Route path="libro-reclamaciones" element={<LibroReclamaciones />} />
          <Route path="libro-reclamaciones/registrar" element={<RegistrarReclamo />} />
          <Route path="libro-reclamaciones/consultar" element={<ConsultarReclamo />} />
          <Route path="campanas" element={<Campanas />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="loading" element={<Loading />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </>
  );
}