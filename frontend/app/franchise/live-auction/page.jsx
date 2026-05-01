"use client";

import { useEffect, useRef, useState } from "react";
import {
  Broadcast,
  CoinVertical,
  MonitorPlay,
  Timer,
  TrendUp,
  Trophy,
} from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { PageHeader, SectionCard, Toast, useToast } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatCurrency, formatTime } from "../../lib/format";
import { getSocket } from "../../lib/socket";

const BID_INCREMENTS = [100000, 500000, 1000000, 2500000, 5000000];

export default function FranchiseLiveAuction() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [team, setTeam] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [bidLog, setBidLog] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [bidding, setBidding] = useState(false);
  const socketRef = useRef(null);
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    apiFetch("/super-admin/auctions")
      .then((items) => {
        setAuctions(items);
        setSelectedAuction(items[0] || null);
      })
      .catch(() => {});

    apiFetch("/franchise/my-team").then(setTeam).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedAuction) return;

    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("join_auction", selectedAuction.auction_id);

    socket.on("auction_sync", (data) => {
      setTimeLeft(data.timeLeft);
      setIsActive(data.isActive);
      setCurrentPlayer(data.currentPlayer);
      setHighestBid(data.highestBid || 0);
      setHighestBidder(data.highestBidder);
    });
    socket.on("bid_updated", (data) => {
      setHighestBid(Number(data.amount || data.bid_amount));
      setHighestBidder({ team_id: data.team_id, team_name: data.team_name });
      setBidLog((current) => [{ ...data, time: new Date() }, ...current].slice(0, 30));
    });
    socket.on("timer_update", setTimeLeft);
    socket.on("auction_started", () => setIsActive(true));
    socket.on("auction_timeout", () => {
      setIsActive(false);
      setTimeLeft(0);
    });
    socket.on("player_changed", (player) => {
      setCurrentPlayer(player);
      setHighestBid(Number(player.base_price || 0));
      setHighestBidder(null);
      setTimeLeft(15);
      setIsActive(false);
    });

    return () => {
      socket.off("auction_sync");
      socket.off("bid_updated");
      socket.off("timer_update");
      socket.off("auction_started");
      socket.off("auction_timeout");
      socket.off("player_changed");
    };
  }, [selectedAuction]);

  const placeBid = async (amount) => {
    if (!team || !currentPlayer || !selectedAuction || bidding) return;

    if (amount > Number(team.remaining_budget || 0)) {
      toast("Insufficient budget for this bid.", "error");
      return;
    }

    setBidding(true);
    try {
      await apiFetch("/franchise/bid", {
        method: "POST",
        body: JSON.stringify({
          player_id: currentPlayer.player_id,
          auction_id: selectedAuction.auction_id,
          bid_amount: amount,
        }),
      });

      socketRef.current?.emit("franchise_bid", {
        auction_id: selectedAuction.auction_id,
        player_id: currentPlayer.player_id,
        team_id: team.team_id,
        team_name: team.team_name,
        amount,
      });

      toast(`Bid submitted: ${formatCurrency(amount)}`, "success");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBidding(false);
    }
  };

  const timerTone =
    timeLeft > 10 ? "text-[var(--success)] border-[var(--success)]" : timeLeft > 5 ? "text-[var(--accent)] border-[var(--accent)]" : "text-[var(--danger)] border-[var(--danger)]";
  const isMyBid = highestBidder?.team_id === team?.team_id;
  const nextBase = Number(highestBid || currentPlayer?.base_price || 0);

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PlayerStatsOverlay
        player={currentPlayer}
        visible={showOverlay}
        bidAmount={highestBid}
        bidder={highestBidder}
      />

      <PageHeader
        title="Live Bidding Desk"
        subtitle={`${team?.team_name || user?.username || "Franchise"} · Remaining budget ${formatCurrency(team?.remaining_budget)}`}
        action={
          <select
            className="select min-w-[220px]"
            value={selectedAuction?.auction_id || ""}
            onChange={(event) =>
              setSelectedAuction(
                auctions.find((auction) => String(auction.auction_id) === event.target.value) || null,
              )
            }
          >
            <option value="">Select auction</option>
            {auctions.map((auction) => (
              <option key={auction.auction_id} value={auction.auction_id}>
                {auction.auction_name} · {auction.season}
              </option>
            ))}
          </select>
        }
      />

      {selectedAuction ? (
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <SectionCard title="On Screen Player" sub="Live player nomination with broadcast context and bid response.">
              {currentPlayer ? (
                <div className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
                    <div className="rounded-[28px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(15,118,110,0.1),rgba(255,255,255,0.92))] p-6">
                      <div className="flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="h-28 w-28 overflow-hidden rounded-[26px] border border-[var(--line)] bg-white">
                          {currentPlayer.image_url ? (
                            <img
                              src={currentPlayer.image_url.startsWith("/") ? currentPlayer.image_url : `/uploads/${currentPlayer.image_url}`}
                              alt={currentPlayer.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[var(--accent)]">
                              <Trophy size={36} weight="duotone" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h2 className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.06em] text-slate-950">
                            {currentPlayer.name}
                          </h2>
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            {currentPlayer.role || "Player"} · {currentPlayer.country_name || "Unassigned country"}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="badge badge-neutral">{currentPlayer.category_name || "Open category"}</span>
                            <button className="btn-outline" onClick={() => setShowOverlay(true)}>
                              <MonitorPlay size={18} />
                              Full Stats
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-[28px] border border-[var(--line)] bg-white p-6">
                        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Current Bid
                        </p>
                        <p className="kpi-value mt-3 text-5xl font-bold text-slate-950">
                          {formatCurrency(highestBid || currentPlayer.base_price)}
                        </p>
                        <p className={`mt-3 text-sm ${isMyBid ? "text-[var(--success)]" : "text-[var(--muted)]"}`}>
                          {highestBidder
                            ? isMyBid
                              ? "You are currently leading."
                              : `Leading team: ${highestBidder.team_name}`
                            : "No bid leader yet"}
                        </p>
                      </div>

                      <div className={`rounded-full border-4 bg-white p-6 text-center ${timerTone}`}>
                        <Timer size={24} className="mx-auto" />
                        <p className="kpi-value mt-3 text-5xl font-bold">{timeLeft}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">seconds left</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[var(--line)] bg-white p-6">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Place Incremental Bid
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {BID_INCREMENTS.map((increment) => {
                        const bidAmount = nextBase + increment;
                        const canAfford = bidAmount <= Number(team?.remaining_budget || 0);
                        return (
                          <button
                            key={increment}
                            className={canAfford && isActive ? "btn-primary justify-between" : "btn-outline justify-between"}
                            disabled={!isActive || !canAfford || bidding}
                            onClick={() => placeBid(bidAmount)}
                          >
                            <span>+ {formatCurrency(increment)}</span>
                            <span>{formatCurrency(bidAmount)}</span>
                          </button>
                        );
                      })}
                    </div>
                    {!isActive ? (
                      <p className="mt-4 text-sm text-[var(--muted)]">
                        Waiting for the admin to start the live bidding clock.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[var(--line-strong)] bg-white/70 px-6 py-16 text-center text-[var(--muted)]">
                  Waiting for the next player nomination from the auction floor.
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Bid Pressure" sub="Live franchise context for the current player.">
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-[22px] border border-[var(--line)] bg-white p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CoinVertical size={18} className="text-[var(--accent)]" />
                    Remaining Budget
                  </div>
                  <p className="kpi-value mt-3 text-4xl font-bold text-slate-950">
                    {formatCurrency(team?.remaining_budget)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[var(--line)] bg-white p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <TrendUp size={18} className="text-[var(--accent)]" />
                    Bid Status
                  </div>
                  <p className="mt-3 text-lg font-semibold text-slate-950">
                    {isMyBid ? "Leading" : highestBidder ? "Chasing" : "Open"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[var(--line)] bg-white p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Broadcast size={18} className="text-[var(--accent)]" />
                    Auction
                  </div>
                  <p className="mt-3 text-lg font-semibold text-slate-950">
                    {selectedAuction.auction_name}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Bid History" padded={false}>
              <div className="max-h-[520px] overflow-y-auto">
                {bidLog.length ? (
                  bidLog.map((item, index) => (
                    <div
                      key={`${item.team_id}-${item.amount || item.bid_amount}-${index}`}
                      className="border-b border-[var(--line)] px-6 py-4 last:border-b-0"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className={`font-semibold ${item.team_id === team?.team_id ? "text-[var(--success)]" : "text-slate-950"}`}>
                            {item.team_name}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">{formatTime(item.time)}</p>
                        </div>
                        <p className="text-sm font-semibold text-[var(--accent)]">
                          {formatCurrency(item.amount || item.bid_amount)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-[var(--muted)]">No bids placed yet.</div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      ) : (
        <SectionCard padded={false}>
          <div className="px-6 py-16 text-center text-[var(--muted)]">
            No auction season is available for live bidding yet.
          </div>
        </SectionCard>
      )}
    </DashboardLayout>
  );
}
