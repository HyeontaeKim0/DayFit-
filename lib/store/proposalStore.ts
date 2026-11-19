import { create } from "zustand";
import type { ChangeProposal } from "@/lib/ai/schema";

/**
 * 지금 승인을 기다리는 변경안 하나.
 * QuickAdd(문장 추가)와 지난 일정 확인 팝업(재배치)이 서로 다른 트리에 있어서,
 * 둘 다 여기에 변경안을 올리고 미리보기 팝업 하나가 이걸 보여준다.
 * 승인 전에는 일정 스토어(eventStore)를 건드리지 않는다.
 */
type ProposalState = {
  proposal: ChangeProposal | null;
  open: (proposal: ChangeProposal) => void;
  close: () => void;
};

export const useProposalStore = create<ProposalState>()((set) => ({
  proposal: null,
  open: (proposal) => set({ proposal }),
  close: () => set({ proposal: null }),
}));
