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
import MiPerfil from '../pages/MiPerfil';
import Agenda from '../pages/Agenda';
import ReglamentoInterno from '../pages/ReglamentoInterno';
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
import VacacionesPage from '../pages/rrhh/VacacionesPage';
import ConveniosPage from '../pages/ConveniosPage';

// Páginas de Auditoría
import HistorialAuditoria from '../pages/Auditoria/HistorialAuditoria';

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/intranet" element={<Login />} />
        <Route path="/intranet/lista-pacientes" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <ListaPacientes />
              </SidebarContentWrapper>
            </SidebarProvider>
          </PrivateRoute>
        } />
        <Route path="/intranet/reportes-evaluaciones" element={
          <PrivateRoute>
            <SidebarProvider>
              <Sidebar />
              <SidebarContentWrapper>
                <ReportesEvaluaciones />
              </SidebarContentWrapper>
            </SidebarProvider>
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
          <Route path="libro-reclamaciones" element={<LibroReclamaciones />} />
          <Route path="verificar-documento" element={<VerificarDocumentos />} />
          <Route path="verificar-beneficios" element={<VerificarBeneficios />} />
          <Route path="loading" element={<Loading />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </>
  );
}