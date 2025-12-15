import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Media from "./pages/Media/Media";
import Sections from "./pages/Sections/Sections";
import AskedQuestions from "./pages/AskedQuestions/AskedQuestions";
import PolicyAndPrivacy from "./pages/PolicyAndPrivacy/PolicyAndPrivacy";
import Complaints from "./pages/Complaints/Complaints";
import Notifications from "./pages/Notifications/Notifications";
import LiveBroadcasts from "./pages/LiveBroadCasts/LiveBroadasts";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PolicyView from "./pages/PolicyAndPrivacy/PolicyView";
import PolicyEdit from "./pages/PolicyAndPrivacy/PolicyEdit";
import Moderators from "./pages/Users/Moderators/Moderators";
import StoreOwners from "./pages/Users/StoreOwners/StoreOwners";
import Customers from "./pages/Users/Customers/Customers";
import StoreOwnersProfile from "./pages/Users/StoreOwners/StoreOwnersProfile";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          {/* Protected Routes (requires login) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<Home />} />
            <Route index path="/users/moderators" element={<Moderators />} />
            <Route index path="/users/store-owners" element={<StoreOwners />} />
            <Route
              index
              path="/users/store-owners/store-owners-profile/:ownerId"
              element={<StoreOwnersProfile />}
            />
            <Route index path="/users/customers" element={<Customers />} />
            <Route index path="/media" element={<Media />} />
            <Route
              index
              path="/live-broad-casts"
              element={<LiveBroadcasts />}
            />
            <Route index path="/sections" element={<Sections />} />
            <Route index path="/asked-questions" element={<AskedQuestions />} />
            <Route
              index
              path="/policy-and-Privacy"
              element={<PolicyAndPrivacy />}
            />
            <Route
              path="/policy-and-Privacy/policy-view"
              element={<PolicyView />}
            />
            <Route path="/policy-and-Privacy/edit" element={<PolicyEdit />} />

            <Route index path="/complaints" element={<Complaints />} />
            <Route index path="/notifications" element={<Notifications />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
