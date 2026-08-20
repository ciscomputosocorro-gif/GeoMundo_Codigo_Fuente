import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgresoProvider } from "@/lib/progreso";
import SplashScreen from "@/components/SplashScreen";

import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Explorar from "@/pages/Explorar";
import FiguraDetalle from "@/pages/FiguraDetalle";
import Jugar from "@/pages/Jugar";
import CualEsJuego from "@/pages/juegos/CualEs";
import EncuentraJuego from "@/pages/juegos/Encuentra";
import CuentaJuego from "@/pages/juegos/Cuenta";
import ClasificaJuego from "@/pages/juegos/Clasifica";
import Practicar from "@/pages/Practicar";
import Evaluacion from "@/pages/Evaluacion";
import Progreso from "@/pages/Progreso";
import Configuracion from "@/pages/Configuracion";
import VRCabana from "@/pages/VRCabana";
import VRCiudad from "@/pages/VRCiudad";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/explorar" component={Explorar} />
      <Route path="/explorar/:id" component={FiguraDetalle} />
      <Route path="/jugar" component={Jugar} />
      <Route path="/jugar/cual-es" component={CualEsJuego} />
      <Route path="/jugar/encuentra" component={EncuentraJuego} />
      <Route path="/jugar/cuenta" component={CuentaJuego} />
      <Route path="/jugar/clasifica" component={ClasificaJuego} />
      <Route path="/practicar" component={Practicar} />
      <Route path="/evaluacion" component={Evaluacion} />
      <Route path="/progreso" component={Progreso} />
      <Route path="/configuracion" component={Configuracion} />
      <Route path="/vr-cabana" component={VRCabana} />
      <Route path="/vr-ciudad" component={VRCiudad} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ProgresoProvider>
        <TooltipProvider>
          <SplashScreen onDone={() => setSplashDone(true)} />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ProgresoProvider>
    </QueryClientProvider>
  );
}

export default App;
