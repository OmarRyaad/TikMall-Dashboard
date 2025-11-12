import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Moderators from "./pages/Users/Moderators";
import StoreOwners from "./pages/Users/StoreOwners";
import Customers from "./pages/Users/Customers";
import Media from "./pages/Media/Media";
import Sections from "./pages/Sections/Sections";
import AskedQuestions from "./pages/AskedQuestions/AskedQuestions";
import PolicyAndPrivacy from "./pages/PolicyAndPrivacy/PolicyAndPrivacy";
import Complaints from "./pages/Complaints/Complaints";
import Notifications from "./pages/Notifications/Notifications";
import LiveBroadcasts from "./pages/LiveBroadCasts/LiveBroadasts";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route index path="/users/moderators" element={<Moderators />} />
            <Route index path="/users/store-owners" element={<StoreOwners />} />
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
            <Route index path="/complaints" element={<Complaints />} />
            <Route index path="/notifications" element={<Notifications />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

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
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
