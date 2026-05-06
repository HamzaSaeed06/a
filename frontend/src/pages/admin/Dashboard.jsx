import { useEffect, useState } from "react";
import { Broadcast, CurrencyCircleDollar, FlagBanner, TrendUp, UsersThree, Warehouse, Clock, ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { PageHeader, SectionCard, StatCard, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Skeleton, SkeletonTable } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { formatCurrency, formatTime } from "../../lib/format";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/admin/dashboard-stats").catch(() => null), 
      apiFetch("/admin/recent-log").catch(() => [])
    ]).then(([dashboardStats, recentLog]) => {
      setStats(dashboardStats);
      setLog(recentLog || []);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <PageHeader 
        title="Auction Control Center" 
        subtitle="Monitor and manage your auction operations"
      />
      
      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 mb-8"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          ))
        ) : (
          [
            { title: "Teams", value: stats?.total_teams ?? "-", icon: UsersThree, tone: "accent" },
            { title: "Players", value: stats?.total_players ?? "-", icon: Warehouse, tone: "default" },
            { title: "Sold", value: stats?.sold_players ?? "-", icon: FlagBanner, tone: "success" },
            { title: "Unsold", value: stats?.unsold_players ?? "-", icon: Broadcast, tone: "warning" },
            { title: "Total Bids", value: stats?.total_bids ?? "-", icon: TrendUp, tone: "accent" },
            { title: "Total Spend", value: formatCurrency(stats?.total_spent), icon: CurrencyCircleDollar, tone: "success" },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
            >
              <StatCard {...card} />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Live Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <SectionCard 
            title="Live Auction Feed" 
            sub="Recent bidding activity"
            padded={false}
            action={
              <div className="live-indicator">
                <span>Live</span>
              </div>
            }
          >
            {loading ? (
              <div className="p-4">
                <SkeletonTable rows={5} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.length ? log.map((item, index) => (
                    <TableRow key={`${item.log_time}-${index}`}>
                      <TableCell className="text-slate-400 font-medium">{index + 1}</TableCell>
                      <TableCell className="text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400" />
                          {formatTime(item.log_time)}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          {item.country_code && (
                            <img 
                              src={`https://flagcdn.com/w40/${item.country_code.toLowerCase()}.png`} 
                              alt="" 
                              className="country-flag" 
                            />
                          )}
                          {item.player_name || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{item.team_name || "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          item.action === "SOLD" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : item.action === "UNSOLD" 
                            ? "bg-red-50 text-red-700" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {item.action}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-teal-600">
                        {item.amount ? formatCurrency(item.amount) : "-"}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-400 text-sm py-12">
                        No activity logged yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </motion.div>

        {/* Guidelines */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <SectionCard title="Operational Guidelines" sub="Best practices for auction management">
            <div className="space-y-4">
              {[
                { 
                  text: "Ensure the player pool is correctly ordered before initiating the auction.", 
                  step: "01" 
                },
                { 
                  text: "Monitor franchise budgets after each successful bid.", 
                  step: "02" 
                },
                { 
                  text: "Activate the Broadcast View to display player statistics during bidding.", 
                  step: "03" 
                },
              ].map((item) => (
                <motion.div 
                  key={item.step} 
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 rounded-xl bg-slate-50 border border-slate-100 p-4 cursor-default"
                >
                  <span className="shrink-0 rounded-lg bg-white border border-slate-200 h-8 w-8 flex items-center justify-center text-xs font-bold text-teal-600 shadow-sm">
                    {item.step}
                  </span>
                  <p className="text-sm leading-6 text-slate-600 font-medium">{item.text}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <a 
                href="#" 
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                View full documentation
                <ArrowUpRight size={16} weight="bold" />
              </a>
            </div>
          </SectionCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
